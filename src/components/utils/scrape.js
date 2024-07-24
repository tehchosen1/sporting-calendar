const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

let sportingURL = "https://www.sporting.pt";
const playerPageUrls = [
  "/pt/futebol/equipa-principal/plantel/franco-israel-wibmer",
  "/pt/futebol/equipa-principal/plantel/vladan-kovacevic",
  "/pt/futebol/equipa-principal/plantel/matheus-reis-de-lima",
  "/pt/futebol/equipa-principal/plantel/jeremiah-israel-st-juste",
  "/pt/futebol/equipa-principal/plantel/ivan-fresneda-corraliza",
  "/pt/futebol/equipa-principal/plantel/goncalo-bernardo-inacio",
  "/pt/futebol/equipa-principal/plantel/ousmane-diomande",
  "/pt/futebol/equipa-principal/plantel/joao-antonio-nascimento-muniz",
  "/pt/futebol/equipa-principal/plantel/ricardo-sousa-esgaio",
  "/pt/futebol/equipa-principal/plantel/zeno-koen-debast",
  "/pt/futebol/equipa-principal/plantel/eduardo-filipe-quaresma-vieira-coimbra-simoes",
  "/pt/futebol/equipa-principal/plantel/hidemasa-morita",
  "/pt/futebol/equipa-principal/plantel/pedro-antonio-pereira-goncalves",
  "/pt/futebol/equipa-principal/plantel/daniel-santos-braganca",
  "/pt/futebol/equipa-principal/plantel/morten-blom-due-hjulmand",
  "/pt/futebol/equipa-principal/plantel/koba-lein-koindredi",
  "/pt/futebol/equipa-principal/plantel/viktor-einar-gyokeres",
  "/pt/futebol/equipa-principal/plantel/marcus-edwards",
  "/pt/futebol/equipa-principal/plantel/nuno-miguel-gomes-dos-santos",
  "/pt/futebol/equipa-principal/plantel/francisco-antonio-machado-mota-castro-trincao",
  "/pt/futebol/equipa-principal/plantel/geny-cipriano-catamo",
];

async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });
    response.data.pipe(fs.createWriteStream(filepath));
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
  }
}

async function downloadPlayerImages() {
  let imageUrls = [];

  for (let playerPageUrl of playerPageUrls) {
    try {
      const playerPageResponse = await axios.get(sportingURL + playerPageUrl, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const $ = cheerio.load(playerPageResponse.data);
      const playerImageUrl =
        $("div.player__photo")
          .css("background-image")
          ?.replace("url('", "")
          .replace("')", "") || "";
      console.log(playerImageUrl);
      if (playerImageUrl) {
        imageUrls.push(playerImageUrl);
      }
    } catch (error) {
      console.error(
        `Failed to scrape player image for ${playerPageUrl}:`,
        error
      );
    }
  }

  const photosDir = path.join(__dirname, "../../../public", "photos");
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }

  const downloadPromises = imageUrls.map((url, index) => {
    const filepath = path.join(photosDir, `player${index + 1}.jpg`);
    return downloadImage(url, filepath);
  });

  await Promise.all(downloadPromises);
  console.log("All images downloaded");
}

downloadPlayerImages().catch(console.error);
