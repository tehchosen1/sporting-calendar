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

const API_BASE_URL = "https://sporting-calendar-api.onrender.com/api"; // Update this with your server's URL

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
  const localStorageData =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;

  const shouldFetchNewData = () => {
    if (!localStorageData) return true;
    const cachedMatches: MatchInfo[] = JSON.parse(localStorageData);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    return cachedMatches.some((match) => {
      const matchDate = new Date(match.date);
      return matchDate < today;
    });
  };

  if (localStorageData && !shouldFetchNewData()) {
    return JSON.parse(localStorageData);
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${month}/${year}`);
      const matches: MatchInfo[] = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(matches));
      }
      const updatedMatches = matches.map((match) => ({
        ...match,
        teamIcon: `${API_BASE_URL}/images/${encodeURIComponent(
          match.teamName.replace(/\s+/g, "_")
        )}.png`,
        leagueIcon: `${API_BASE_URL}/images/league_${encodeURIComponent(
          match.leagueName.replace(/\s+/g, "_")
        )}.png`,
      }));
      return updatedMatches;
    } catch (error) {
      console.error("Error fetching matches:", error);
      return localStorageData ? JSON.parse(localStorageData) : [];
    }
  }
};

export const scrapePlayerImage = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/player-image`);
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Failed to fetch player image:", error);
    return null;
  }
};

export default fetchMatchesForMonthYear;
