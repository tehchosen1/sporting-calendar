const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
const port = 3001; // Choose an appropriate port
const dotenv = require("dotenv");

dotenv.config();

const IMAGES_DIR = path.join(__dirname, "images");

// Ensure the directory exists on server start
(async () => {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating images directory:", error);
  }
})();

const staticUrls = [
  `https://www.zerozero.pt/img/logos/edicoes/`,
  `https://www.zerozero.pt/img/logos/competicoes/`,
  `https://www.zerozero.pt/img/logos/equipas/`,
];

async function downloadImage(url, filename) {
  const imagePath = path.join(IMAGES_DIR, filename);

  // Check if file already exists
  try {
    await fs.access(imagePath);
    return `${filename}`;
  } catch {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      await fs.writeFile(imagePath, response.data);
      return `${filename}`;
    } catch (error) {
      // If the image download fails, try the static URLs

      for (const staticUrl of staticUrls) {
        try {
          const response = await axios.get(staticUrl + filename, {
            responseType: "arraybuffer",
          });
          await fs.writeFile(imagePath, response.data);
          return `${filename}`;
        } catch (staticError) {
          // console.error(`Error downloading from ${staticUrl}:`, staticError);
        }
      }

      // throw new Error(`Failed to download image from all URLs for ${filename}`);
    }
  }
}

app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// In-memory cache
const cache = { matches: {}, playerImages: [] };

const TEAM_URL =
  "https://www.zerozero.pt/equipa/sporting/jogos?grp=0&equipa_1=16&menu=allmatches";
const SPORTING_URL =
  "https://www.sporting.pt/pt/futebol/equipa-principal/plantel";

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const matchSchema = new mongoose.Schema({ date: Date, data: Object });
const Match = mongoose.model("Match", matchSchema);

// Function to scrape matches
async function scrapeMatches(month, year) {
  let browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    headless: "true",
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
    );
    await page.goto(TEAM_URL, { waitUntil: "networkidle0" });

    const matches = await page.evaluate(
      (month, year) => {
        const matchInfos = [];
        const rows = document.querySelectorAll("#team_games .stats tr.parent");
        rows.forEach((row) => {
          const dateText = row.querySelector("td.double")?.textContent?.trim();
          if (!dateText) return;

          const date = new Date(dateText);
          if (date.getMonth() + 1 === month && date.getFullYear() === year) {
            matchInfos.push({
              date: dateText,
              time:
                row.querySelector("td:nth-child(3)")?.textContent?.trim() || "",
              field:
                row.querySelector("td:nth-child(4)")?.textContent?.trim() || "",
              teamIcon: row.querySelector("td a img")?.src || "",
              leagueHref:
                row.querySelector("td .micrologo_and_text .text a")?.href || "",
              teamName:
                row.querySelector("td.text a")?.textContent?.trim() || "",
              leagueIcon: row.querySelector("td img:nth-child(2)")?.src || "",
              leagueName:
                row
                  .querySelector("td .micrologo_and_text .text a")
                  ?.textContent?.trim() || "",
              result: row.querySelector(".result")?.textContent?.trim() || "",
            });
          }
        });
        return matchInfos;
      },
      month,
      year
    );

    for (const match of matches) {
      // console.log(match);
      if (match.teamIcon) {
        const filename = path.basename(match.teamIcon);
        match.teamIcon = await downloadImage(match.teamIcon, filename);
      }

      if (match.leagueHref) {
        const leagueIconFilename = `league_${path.basename(match.leagueIcon)}`;

        try {
          await fs.access(path.join(IMAGES_DIR, leagueIconFilename));
          match.leagueIcon = `/api/images${leagueIconFilename}`;
        } catch {
          await page.goto(match.leagueHref, { waitUntil: "networkidle0" });
          const leagueIcon = await page.evaluate(() => {
            const imgElement = document.querySelector(".profile_picture img");
            return imgElement ? imgElement.src : "";
          });

          if (leagueIcon) {
            const filename = path.basename(leagueIcon);
            match.leagueIcon = await downloadImage(leagueIcon, filename);
          }
        }
      }
    }
    return matches.reverse();
  } catch (error) {
    // console.error("Error in scrapeMatches:", error);
    // throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Function to scrape player images
async function scrapePlayerImages() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(SPORTING_URL);

  const playerUrls = await page.evaluate(() => {
    const urls = [];
    document
      .querySelectorAll(".plantelPosicoes .players__item a")
      .forEach((a) => {
        if (!a.href.includes("equipa-tecnica")) {
          urls.push(a.href);
        }
      });
    return urls;
  });

  const playerImageUrls = [];
  for (const url of playerUrls) {
    await page.goto(url);
    const imageUrl = await page.evaluate(() => {
      const style =
        document.querySelector("div.player__photo").style.backgroundImage;
      return style.replace(/url\("?(.+?)"?\)/, "$1");
    });
    playerImageUrls.push(imageUrl);
  }

  await browser.close();
  return playerImageUrls;
}

// Endpoint to get matches
app.get("/api/matches/:month/:year", async (req, res) => {
  const { month, year } = req.params;
  const queryDate = new Date(year, month - 1);

  try {
    let match = await Match.findOne({ date: queryDate });

    if (!match) {
      const matches = await scrapeMatches(parseInt(month), parseInt(year));
      match = new Match({ date: queryDate, data: matches });
      await match.save();
    }

    res.json(match.data);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Endpoint to get player images
app.get("/api/player-image", async (req, res) => {
  if (cache.playerImages.length === 0) {
    try {
      cache.playerImages = await scrapePlayerImages();
    } catch (error) {
      console.error("Error fetching player images:", error);
      return res.status(500).json({ error: "Failed to fetch player images" });
    }
  }

  const randomIndex = Math.floor(Math.random() * cache.playerImages.length);
  res.json({ imageUrl: cache.playerImages[randomIndex] });
});

// Endpoint to get images
app.get("/api/images/:filename", async (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(IMAGES_DIR, filename);

  try {
    await fs.access(imagePath);
  } catch (error) {
    // Image does not exist, redownload it
    try {
      const match = await Match.findOne({
        $or: [{ "data.teamIcon": filename }, { "data.leagueIcon": filename }],
      });
      if (match) {
        const matchData = match.data.find(
          (m) => filename === m.teamIcon || filename === m.leagueIcon
        );
        const imageUrl = matchData
          ? matchData.teamIcon || matchData.leagueIcon
          : null;

        if (imageUrl) {
          await downloadImage(imageUrl, filename);
        }
      }
    } catch (downloadError) {
      console.error("Error redownloading image:", downloadError);
    }
  }

  res.sendFile(imagePath);
});

app.get("/file-list", async (req, res) => {
  const filePath = path.join(__dirname, "files_list.txt");
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    res.send(`<pre>${fileContent}</pre>`);
  } catch (error) {
    res.status(500).send("Error reading file list");
  }
});

app.listen(port, () => {
  console.log(`Server running`);
});
