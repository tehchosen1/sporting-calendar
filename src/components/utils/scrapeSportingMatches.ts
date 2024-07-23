import axios from 'axios';
import cheerio from 'cheerio';

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
const BASE_URL = 'https://cors-anywhere.herokuapp.com/';
const BASE_NOPROXY_URL = 'https://www.zerozero.pt';

// Get current month and year
function getCurrentMonthYear(): { month: number, year: number } {
    const date = new Date();
    return {
        month: date.getMonth() + 1,
        year: date.getFullYear()
    };
}

// Generate a key for caching purposes
function generateMonthYearKey(month: number, year: number): string {
    return `${year}-${month.toString().padStart(2, '0')}`;
}

// Fetch matches for a given month and year
async function fetchMatchesForMonthYear(month: number = getCurrentMonthYear().month, year: number = getCurrentMonthYear().year): Promise<MatchInfo[]> {
    const key = generateMonthYearKey(month, year);
    const cachedData = localStorage.getItem(key);

    if (cachedData) {
        const matches = JSON.parse(cachedData) as MatchInfo[];
        if (matches.length > 0) {
            return matches;
        }
    }

    const matches = await fetchDataFromServer(month, year);
    if (matches.length > 0) {
        localStorage.setItem(key, JSON.stringify(matches));
    }

    return matches;
}

// Fetch data from server and parse it
async function fetchDataFromServer(month: number, year: number): Promise<MatchInfo[]> {
    const url = `${BASE_URL}https://www.zerozero.pt/equipa/sporting/jogos`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const matches: MatchInfo[] = [];

    // Assuming the structure of the HTML contains a certain class or id
    $('.classOrIdForMatches').each((_, element) => {
        const date = $(element).find('.classOrIdForDate').text().trim();
        const time = $(element).find('.classOrIdForTime').text().trim();
        const field = $(element).find('.classOrIdForField').text().trim();
        const teamIcon = $(element).find('.classOrIdForTeamIcon').attr('src') || '';
        const teamName = $(element).find('.classOrIdForTeamName').text().trim();
        const leagueIcon = $(element).find('.classOrIdForLeagueIcon').attr('src') || '';
        const leagueName = $(element).find('.classOrIdForLeagueName').text().trim();
        const result = $(element).find('.classOrIdForResult').text().trim();

        const matchDate = new Date(date);
        if (matchDate.getMonth() + 1 === month && matchDate.getFullYear() === year) {
            matches.push({ date, time, field, teamIcon, teamName, leagueIcon, leagueName, result });
        }
    });

    return matches.reverse();
}

// Scrape a random Sporting CP player image
async function scrapePlayerImage(): Promise<string | null> {
  try {
    const { data } = await axios.get(`${BASE_URL}https://www.sporting.pt/pt/futebol/equipa-principal/plantel`);
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
    const playerPageResponse = await axios.get(`${BASE_URL}https://www.sporting.pt/` + playerPageUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } });
    const $$ = cheerio.load(playerPageResponse.data);
    const playerImageUrl = $$("div.player__photo").css("background-image")?.replace(/url\("?(.+?)"?\)/, "$1") || "";

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
    scrapePlayerImage
};
export default fetchMatchesForMonthYear;
