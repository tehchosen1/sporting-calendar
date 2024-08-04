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
fs.mkdir(IMAGES_DIR, { recursive: true });

async function downloadImage(url, filename) {
  const imagePath = path.join(IMAGES_DIR, filename);

  // Check if file already exists
  try {
    await fs.access(imagePath);
    console.log(`File ${filename} already exists. Skipping download.`);
    return `/api/images/${filename}`;
  } catch {
    // File does not exist, proceed with download
    console.log(`Downloading ${filename} from ${url}`);
    const response = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(imagePath, response.data);
    return `/api/images/${filename}`;
  }
}

app.use(
  cors({
    origin: "*", // Allow only your frontend origin
    methods: ["GET"], // Allow only GET requests
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// In-memory cache
const cache = {
  matches: {},
  playerImages: [],
};

const TEAM_URL =
  "https://www.zerozero.pt/equipa/sporting/jogos?grp=0&equipa_1=16&menu=allmatches";
const SPORTING_URL =
  "https://www.sporting.pt/pt/futebol/equipa-principal/plantel";

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const matchSchema = new mongoose.Schema({
  date: Date,
  data: Object,
});

const Match = mongoose.model("Match", matchSchema);

// Function to scrape matches
async function scrapeMatches(month, year) {
  let browser;
  browser = await puppeteer.launch({
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
      if (match.teamIcon) {
        match.teamIcon = await downloadImage(
          match.teamIcon,
          `${match.teamName.replace(/\s+/g, "_")}.png`
        );
      }

      if (match.leagueHref) {
        const leagueIconFilename = `league_${match.leagueName.replace(
          /[\/\s]+/g,
          "_"
        )}.png`;

        // Check if league icon already exists
        try {
          await fs.access(path.join(IMAGES_DIR, leagueIconFilename));
          console.log(
            `League icon for ${match.leagueName} already exists. Skipping download.`
          );
          match.leagueIcon = `/api/images/${leagueIconFilename}`;
        } catch {
          // File does not exist, proceed with scraping
          await page.goto(match.leagueHref, { waitUntil: "networkidle0" });
          console.log("Scraping league icon for:", match.leagueName);
          const leagueIcon = await page.evaluate(() => {
            const imgElement = document.querySelector(".profile_picture img");
            return imgElement ? imgElement.src : "";
          });

          if (leagueIcon) {
            match.leagueIcon = await downloadImage(
              leagueIcon,
              `league_${match.leagueName.replace(/[\/\s]+/g, "_")}.png`
            );
          }
        }
      }
    }
    return matches.reverse();
  } catch (error) {
    console.error("Error in scrapeMatches:", error);
    throw error;
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

    console.log(match);
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
app.get("/api/images/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(IMAGES_DIR, filename));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
