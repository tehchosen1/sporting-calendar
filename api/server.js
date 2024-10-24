require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");

// Constants
const app = express();
const PORT = process.env.PORT || 3001;
const IMAGES_DIR = path.resolve(__dirname, "images");
const LEAGUE_URL_PREFIX = "https://www.zerozero.pt/img/logos/competicoes/";
const TEAM_URL_PREFIX = "https://www.zerozero.pt/img/logos/equipas/";
const TEAM_URL =
  "https://www.zerozero.pt/equipa/sporting/jogos?grp=0&equipa_1=16&menu=allmatches";
const SPORTING_URL =
  "https://www.sporting.pt/pt/futebol/equipa-principal/plantel";

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose model
const matchSchema = new mongoose.Schema({
  date: Date,
  data: Object,
});
const Match = mongoose.model("Match", matchSchema);

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Utility to ensure images directory exists
async function ensureDirectory(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error("Error creating directory:", error);
  }
}
ensureDirectory(IMAGES_DIR);

// Function to download images
async function downloadImage(url, filename, isLeague = false) {
  const imagePath = path.join(IMAGES_DIR, filename);
  const staticUrl = isLeague ? LEAGUE_URL_PREFIX : TEAM_URL_PREFIX;

  try {
    // Check if file already exists
    await fs.access(imagePath);
    return filename;
  } catch {
    try {
      // Try downloading the image from the original URL
      const response = await axios.get(url, { responseType: "arraybuffer" });
      await fs.writeFile(imagePath, response.data);
      return filename;
    } catch (error) {
      // Fallback: try downloading from static URL
      console.warn(`Failed to download ${url}, attempting fallback URL`);
      try {
        const fallbackResponse = await axios.get(`${staticUrl}${filename}`, {
          responseType: "arraybuffer",
        });
        await fs.writeFile(imagePath, fallbackResponse.data);
        return filename;
      } catch (fallbackError) {
        console.error(
          `Failed to download fallback image for ${filename}:`,
          fallbackError
        );
        throw new Error(`Image download failed for ${filename}`);
      }
    }
  }
}

// Function to scrape match data
async function scrapeMatches(month, year) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true,
      executablePath: puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
    );
    await page.goto(TEAM_URL, { waitUntil: "networkidle0", timeout: 60000 });

    const matches = await page.evaluate(
      (month, year) => {
        const matchElements = document.querySelectorAll(
          "#team_games .stats tr.parent"
        );
        return Array.from(matchElements)
          .map((row) => {
            const dateText = row
              .querySelector("td.double")
              ?.textContent?.trim();
            if (!dateText) return null;

            const matchDate = new Date(dateText);
            if (
              matchDate.getMonth() + 1 === month &&
              matchDate.getFullYear() === year
            ) {
              return {
                date: dateText,
                time:
                  row.querySelector("td:nth-child(3)")?.textContent?.trim() ||
                  "",
                field:
                  row.querySelector("td:nth-child(4)")?.textContent?.trim() ||
                  "",
                teamIcon: row.querySelector("td a img")?.src || "",
                leagueHref:
                  row.querySelector("td .micrologo_and_text .text a")?.href ||
                  "",
                teamName:
                  row.querySelector("td.text a")?.textContent?.trim() || "",
                leagueIcon:
                  row.querySelector(".micrologo_and_text img")?.title || "",
                leagueName:
                  row
                    .querySelector("td .micrologo_and_text .text a")
                    ?.textContent?.trim() || "",
                result: row.querySelector(".result")?.textContent?.trim() || "",
              };
            }
          })
          .filter(Boolean);
      },
      month,
      year
    );

    for (let match of matches) {
      if (match.teamIcon) {
        const filename = path.basename(match.teamIcon);
        match.teamIcon = await downloadImage(match.teamIcon, filename);
      }

      if (match.leagueHref) {
        await handleLeagueIcon(page, match);
      }
    }

    return matches.reverse();
  } catch (error) {
    console.error("Error scraping matches:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

// Helper function to handle league icon downloading
async function handleLeagueIcon(page, match) {
  const leagueIconFilename = `league_${path.basename(match.leagueIcon)}`;
  const leagueIconPath = path.join(IMAGES_DIR, leagueIconFilename);

  try {
    await fs.access(leagueIconPath);
    match.leagueIcon = `${leagueIconFilename}`;
  } catch {
    try {
      await page.goto(match.leagueHref, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      const leagueIcon = await page.evaluate(
        () => document.querySelector(".profile_picture img")?.src || ""
      );

      if (leagueIcon) {
        match.leagueIcon = await downloadImage(leagueIcon, leagueIconFilename);
        match.leagueIcon = `/api/images/${leagueIconFilename}`;
      }
    } catch (error) {
      console.error("Error fetching league icon:", error);
      throw error;
    }
  }
}

// Endpoint to fetch matches
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

// Endpoint to serve images
app.get("/api/images/:filename", async (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(IMAGES_DIR, filename);

  try {
    await fs.access(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Error fetching image");
  }
});

// Server listening
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
