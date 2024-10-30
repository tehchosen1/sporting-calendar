// scraper.js
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const iconv = require("iconv-lite");

const url =
  "https://www.zerozero.pt/equipa/sporting/jogos?grp=0&equipa_1=16&menu=allmatches";

axios
  .get(url, { responseType: "arraybuffer" })
  .then(async (response) => {
    const html = iconv.decode(Buffer.from(response.data), "ISO-8859-1");
    const $ = cheerio.load(html, { decodeEntities: false });
    const teams = [];

    $("tr.parent").each((i, elem) => {
      const homeTeam = $(elem).find("td:nth-child(5) a img[alt]");
      const awayTeam = $(elem).find("td:nth-child(6) a img[alt]");

      [homeTeam, awayTeam].forEach((team) => {
        const altText = team.attr("alt");
        const imgSrc = team.attr("src");

        if (imgSrc && imgSrc.includes("/img/logos")) {
          const existingTeam = teams.find((t) => t.name === altText);
          if (!existingTeam) {
            teams.push({
              name: altText,
              logo: `https://www.zerozero.pt${imgSrc}`,
            });
          }
        }
      });
    });

    console.log(teams);

    // Save the teams data as JSON
    try {
      await fs.writeFile(
        "../public/teams.json",
        JSON.stringify(teams, null, 2),
        "utf8"
      );
      console.log("Teams data saved to teams.json");
    } catch (error) {
      console.error("Error saving teams data:", error);
    }
  })
  .catch((error) => {
    console.error(error);
  });
