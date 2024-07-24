import axios from "axios";
import cheerio from "cheerio";
const { CookieJar } = require("tough-cookie");

export interface MatchInfo {
  date: string;
  time: string;
  field: string;
  teamIcon: string;
  teamName: string;
  leagueIcon: string;
  leagueName: string;
  result: string;
}

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const BASE_URL = `${CORS_PROXY}https://www.zerozero.pt`;
const BASE_NOPROXY_URL = "https://www.zerozero.pt";
const TEAM_URL = `${BASE_URL}/equipa/sporting/jogos?grp=0&equipa_1=16&menu=allmatches`;
const SPORTING_URL = `${CORS_PROXY}https://www.sporting.pt/pt/futebol/equipa-principal/plantel`;
const SPORTING_BASE_URL = `${CORS_PROXY}https://www.sporting.pt/`;
const cookieJar = new CookieJar();
let clearCache = false;

export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),
  };
};

export const generateMonthYearKey = (month: number, year: number): string =>
  `${year}-${month.toString().padStart(2, "0")}`;

export const fetchMatchesForMonthYear = async (
  month: number = getCurrentMonthYear().currentMonth,
  year: number = getCurrentMonthYear().currentYear
): Promise<MatchInfo[]> => {
  const key = generateMonthYearKey(month, year);
  if (localStorage.getItem("cleaned") !== "true") {
    localStorage.clear();
    clearCache = true;
    localStorage.setItem("cleaned", "true");
  }
  const localStorageData =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;

  if (localStorageData) {
    const cachedData = JSON.parse(localStorageData);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (
      month !== currentMonth ||
      year !== currentYear ||
      cachedData.length === 0
    ) {
      return await fetchDataFromServer(month, year, key);
    }
    return cachedData;
  } else {
    return await fetchDataFromServer(month, year, key);
  }
};

async function fetchDataFromServer(
  month: number,
  year: number,
  key: string
): Promise<MatchInfo[]> {
  try {
    const response = await axios.get(TEAM_URL, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
      withCredentials: false,
    });
    const $ = cheerio.load(response.data);

    const matches: MatchInfo[] = [];
    $("#team_games .stats tr.parent").each((_, element) => {
      const dateText = $(element).find("td.double").eq(0).text().trim();
      const date = new Date(dateText);
      if (date.getMonth() + 1 === month && date.getFullYear() === year) {
        const matchInfo: MatchInfo = {
          date: dateText,
          time: $(element).find("td").eq(2).text().trim(),
          field: $(element).find("td").eq(3).text().trim(),
          teamIcon:
            BASE_NOPROXY_URL +
            ($(element).find("td a img").attr("src")?.trim() || ""),
          teamName: $(element).find("td.text a").eq(0).text().trim(),
          leagueIcon:
            BASE_URL +
            ($(element).find("td img").eq(1).attr("src")?.trim() || ""),
          leagueName: $(element)
            .find("td .micrologo_and_text .text a")
            .eq(0)
            .text()
            .trim(),
          result: $(element).find(".result").text().trim() || "",
        };
        matches.push(matchInfo);
      }
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(matches));
    }

    return matches.reverse();
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

export const scrapePlayerImage = async () => {
  try {
    const { data } = await axios.get(SPORTING_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });
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
      SPORTING_BASE_URL + playerPageUrl,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      }
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
};

export default fetchMatchesForMonthYear;
