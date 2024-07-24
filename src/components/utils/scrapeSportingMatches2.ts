import axios from "axios";
import cheerio from "cheerio";

// Interface for match information
interface MatchInfo {
  date: string;
  time: string;
  field: string;
  teamIcon: string;
  teamName: string;
  leagueIcon: string;
  leagueName: string;
  result: string;
}

// Base URLs
const BASE_URL = "https://cors-anywhere.herokuapp.com/";
const BASE_NOPROXY_URL = "https://www.zerozero.pt";

// Get current month and year
function getCurrentMonthYear(): { month: number; year: number } {
  const date = new Date();
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

// Generate a key for caching purposes
function generateMonthYearKey(month: number, year: number): string {
  return `${year}-${month.toString().padStart(2, "0")}`;
}

// Fetch matches for a given month and year
async function fetchMatchesForMonthYear(
  month: number = getCurrentMonthYear().month,
  year: number = getCurrentMonthYear().year
): Promise<MatchInfo[]> {
  const key = generateMonthYearKey(month, year);
  const cachedData = localStorage.getItem(key);

  const matches = await fetchDataFromServer(month, year);

  console.log(matches);
  return matches;
}

// Fetch data from server and parse it
async function fetchDataFromServer(
  month: number,
  year: number
): Promise<MatchInfo[]> {
  const url = `${BASE_URL}https://www.zerozero.pt/equipa/sporting/jogos`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const matches: MatchInfo[] = [];

  // Assuming the structure of the HTML contains a certain class or id
  $(".classOrIdForMatches").each((_, element) => {
    const dateText = $(element).find("td.double").eq(0).text().trim();
    const date = dateText;
    const time = $(element).find("td").eq(2).text().trim();
    const field = $(element).find("td").eq(3).text().trim();
    const teamIcon =
      BASE_NOPROXY_URL +
      ($(element).find("td a img").attr("src")?.trim() || "");
    const teamName = $(element).find("td.text a").eq(0).text().trim();
    const leagueIcon =
      $(element).find(".classOrIdForLeagueIcon").attr("src") || "";
    const leagueName = $(element)
      .find("td .micrologo_and_text .text a")
      .eq(0)
      .text()
      .trim();
    const result = $(element).find(".result").text().trim() || "";

    const matchDate = new Date(date);
    if (
      matchDate.getMonth() + 1 === month &&
      matchDate.getFullYear() === year
    ) {
      matches.push({
        date,
        time,
        field,
        teamIcon,
        teamName,
        leagueIcon,
        leagueName,
        result,
      });
    }
  });

  return matches.reverse();
}

// Scrape a random Sporting CP player image
async function scrapePlayerImage(): Promise<string | null> {
  try {
    const { data } = await axios.get(
      `${BASE_URL}https://www.sporting.pt/pt/futebol/equipa-principal/plantel`
    );
    const $ = cheerio.load(data);
    let playerItems: string[] = [];

    $(".plantelPosicoes").each((_, element) => {
      $(element)
        .find(".players__item")
        .each((_, element) => {
          const href = $(element).children("a").attr("href");
          if (href && !href.includes("equipa-tecnica")) {
            playerItems.push(href);
          }
        });
    });

    const randomIndex = Math.floor(Math.random() * playerItems.length);
    const playerPageUrl = playerItems[randomIndex];
    const playerPageResponse = await axios.get(
      `${BASE_URL}https://www.sporting.pt/` + playerPageUrl,
      { headers: { "X-Requested-With": "XMLHttpRequest" } }
    );
    const $$ = cheerio.load(playerPageResponse.data);
    const playerImageUrl =
      $$("div.player__photo")
        .css("background-image")
        ?.replace(/url\("?(.+?)"?\)/, "$1") || "";

    return playerImageUrl;
  } catch (error) {
    console.error("Failed to scrape player image:", error);
    return null;
  }
}

// Export functions
export {
  MatchInfo,
  getCurrentMonthYear,
  generateMonthYearKey,
  fetchMatchesForMonthYear,
  fetchDataFromServer,
  scrapePlayerImage,
};
export default fetchMatchesForMonthYear;
