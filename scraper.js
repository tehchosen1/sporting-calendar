const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const iconv = require("iconv-lite");
const path = require("path");

const url =
  "https://www.zerozero.pt/equipa/sporting/jogos?grp=0&equipa_1=16&menu=allmatches";

axios
  .get(url, { responseType: "arraybuffer" })
  .then(async (response) => {
    const html = iconv.decode(Buffer.from(response.data), "ISO-8859-1");
    const $ = cheerio.load(html, { decodeEntities: false });
    const teams = [];
    const matches = [];

    // First, find and add Sporting's logo from the page
    let sportingLogo = "https://cdn-img.zerozero.pt/img/logos/equipas/16_imgbank.png";
    $("img").each((_, elem) => {
      const alt = $(elem).attr("alt");
      const src = $(elem).attr("src");
      if (alt && alt.toLowerCase().includes("sporting") && src && src.includes("/img/logos/equipas/16_imgbank")) {
        sportingLogo = src.startsWith("http") ? src : `https://cdn-img.zerozero.pt${src}`;
      }
    });

    teams.push({
      name: "Sporting",
      logo: sportingLogo,
    });

    let totalRows = 0;
    let skippedRows = 0;
    const skipReasons = {};
    const matchesToProcess = [];

    $("tr.parent").each((_, elem) => {
      totalRows++;
      const row = $(elem);

      // TD 1 has the date
      const dateElem = row.find("td").eq(1);
      const date = dateElem.text().trim();

      // TD 2 has the time
      const timeElem = row.find("td").eq(2);
      const time = timeElem.text().trim();

      // TD 3 has (C) for home or (F) for away
      const locationElem = row.find("td").eq(3);
      const location = locationElem.text().trim();
      const isHome = location === "(C)";

      // TD 4 has opponent logo
      const opponentImgElem = row.find("td").eq(4).find("img");
      const opponentName = opponentImgElem.attr("alt");
      let opponentLogo = opponentImgElem.attr("src");

      // Convert small icon to high-quality CDN image
      if (opponentLogo && opponentLogo.includes("/img_icon/")) {
        opponentLogo = opponentLogo.replace("/img_icon/", "/img/");
      }
      // Use the _imgbank version for higher quality (same as Sporting's logo)
      if (opponentLogo && opponentLogo.includes(".png") && !opponentLogo.includes("_imgbank")) {
        opponentLogo = opponentLogo.replace(".png", "_imgbank.png");
      }

      // TD 6 has the result - also contains the match page link
      const resultElem = row.find("td").eq(6);
      const result = resultElem.text().trim();
      const matchLink = resultElem.find("a").attr("href");

      // TD 7 has the competition/league
      const leagueElem = row.find("td").eq(7);
      const leagueName = leagueElem.text().trim();
      const leagueImg = leagueElem.find("img");
      let leagueIcon = leagueImg.attr("src") || "";
      if (leagueIcon && !leagueIcon.startsWith("http")) {
        leagueIcon = `https://www.zerozero.pt${leagueIcon}`;
      }

      // TD 8 has the jornada
      const jornadaElem = row.find("td").eq(8);
      const jornada = jornadaElem.text().trim();

      // Add opponent to teams
      if (opponentName && opponentLogo) {
        const existingTeam = teams.find((t) => t.name === opponentName);
        if (!existingTeam) {
          teams.push({
            name: opponentName,
            logo: `https://cdn-img.zerozero.pt${opponentLogo}`,
          });
        }
      }

      // Add match to the matches list
      // Only scrape matches without a result (result is "-") and with a time
      // Exclude matches that have numbers in the result and matches without a time
      const shouldInclude = opponentName && date && result === "-" && time && time !== "TBD" && matchLink;

      if (!shouldInclude) {
        skippedRows++;
        const reason = !opponentName ? "no opponent" :
                      !date ? "no date" :
                      result !== "-" ? `has result: ${result}` :
                      !time ? "no time" :
                      time === "TBD" ? "time is TBD" :
                      !matchLink ? "no match link" : "unknown";
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
      }

      if (shouldInclude) {
        const homeTeam = isHome ? "Sporting" : opponentName;
        const awayTeam = isHome ? opponentName : "Sporting";

        matchesToProcess.push({
          date,
          time: time,
          homeTeam,
          awayTeam,
          result: "",
          leagueName: leagueName || "Unknown",
          leagueIcon,
          jornada: jornada || "",
          matchLink: matchLink.startsWith("http") ? matchLink : `https://www.zerozero.pt${matchLink}`,
          isHome,
        });
      }
    });

    // Now fetch stadium info for each match
    console.log(`\nFetching stadium info for ${matchesToProcess.length} matches...`);
    for (let i = 0; i < matchesToProcess.length; i++) {
      const match = matchesToProcess[i];
      console.log(`[${i + 1}/${matchesToProcess.length}] Fetching ${match.matchLink}`);

      try {
        const matchResponse = await axios.get(match.matchLink, { responseType: "arraybuffer" });
        const matchHtml = iconv.decode(Buffer.from(matchResponse.data), "ISO-8859-1");
        const match$ = cheerio.load(matchHtml, { decodeEntities: false });

        // Extract stadium from the match_data div
        let stadium = "TBD";
        const matchDataDiv = match$("#match_data");
        if (matchDataDiv.length > 0) {
          // Find the anchor tag after the location icon
          const stadiumLink = matchDataDiv.find('a[href*="/estadio.php"]');
          if (stadiumLink.length > 0) {
            stadium = stadiumLink.text().trim();
            // Remove country code in parentheses (e.g., "(POR)", "(IT)")
            const parenIndex = stadium.indexOf('(');
            if (parenIndex !== -1) {
              stadium = stadium.substring(0, parenIndex).trim();
            }
          }
        }

        // Fallback: if no stadium found and it's a home match, use Alvalade
        if (stadium === "TBD" && match.isHome) {
          stadium = "Estádio José de Alvalade";
        }

        matches.push({
          date: match.date,
          time: match.time,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          result: match.result,
          leagueName: match.leagueName,
          leagueIcon: match.leagueIcon,
          stadium,
          jornada: match.jornada,
        });

        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching match ${match.matchLink}:`, error.message);
        // Add match with default stadium on error
        matches.push({
          date: match.date,
          time: match.time,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          result: match.result,
          leagueName: match.leagueName,
          leagueIcon: match.leagueIcon,
          stadium: match.isHome ? "Estádio José de Alvalade" : "TBD",
          jornada: match.jornada,
        });
      }
    }

    console.log("\n=== SCRAPING SUMMARY ===");
    console.log(`Total rows found: ${totalRows}`);
    console.log(`Matches scraped: ${matches.length}`);
    console.log(`Rows skipped: ${skippedRows}`);
    console.log("Skip reasons:", skipReasons);
    console.log("========================\n");

    console.log("Teams:", teams);
    console.log("Matches:", matches);

    // Save teams data to teams.json
    try {
      const teamsPath = path.join(__dirname, "public/teams.json");
      await fs.writeFile(teamsPath, JSON.stringify(teams, null, 2), "utf8");
      console.log("Teams data saved to teams.json");
    } catch (error) {
      console.error("Error saving teams data:", error);
    }

    // Save matches data to matches.json
    try {
      const matchesPath = path.join(__dirname, "public/matches.json");
      await fs.writeFile(
        matchesPath,
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
