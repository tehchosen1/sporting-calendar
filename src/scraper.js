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
    const matches = [];

    $("tr.parent").each((i, elem) => {
      const homeTeamElem = $(elem).find("td:nth-child(5) a img[alt]");
      const awayTeamElem = $(elem).find("td:nth-child(6) a img[alt]");
      const resultElem = $(elem).find("td.result");
      const textElem = $(elem).find("td.text a");

      const homeTeam = homeTeamElem.attr("alt");
      const awayTeam = awayTeamElem.attr("alt");
      const result = resultElem.text().trim();
      const opponentTeam = textElem.text().trim();

      // Add teams to the teams list
      [homeTeam, awayTeam].forEach((team, idx) => {
        const imgElem = idx === 0 ? homeTeamElem : awayTeamElem;
        const imgSrc = imgElem.attr("src");

        if (team && imgSrc && imgSrc.includes("/img/logos")) {
          const existingTeam = teams.find((t) => t.name === team);
          if (!existingTeam) {
            teams.push({
              name: team,
              logo: `https://www.zerozero.pt${imgSrc}`,
            });
          }
        }
      });

      // Add match to the matches list
      if (homeTeam && awayTeam && result) {
        matches.push({
          homeTeam,
          awayTeam,
          result,
          opponent: opponentTeam, // Optional, provides extra context
        });
      }
    });

    console.log("Teams:", teams);
    console.log("Matches:", matches);

    // Save teams data to teams.json
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

    // Save matches data to matches.json
    try {
      await fs.writeFile(
        "../public/matches.json",
        JSON.stringify(matches, null, 2),
        "utf8"
      );
      console.log("Matches data saved to matches.json");
    } catch (error) {
      console.error("Error saving matches data:", error);
    }
  })
  .catch((error) => {
    console.error(error);
  });
