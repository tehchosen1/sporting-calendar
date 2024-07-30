import { useState, useEffect } from "react";
import fetchMatchesForMonthYear, {
  MatchInfo,
} from "../components/utils/scrapeSportingMatches";
import { is } from "cheerio/lib/api/traversing";

const useMatches = () => {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [getIsLoading, setIsLoading] = useState<boolean | null>(null);

  useEffect(() => {
    const key = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;

    const loadMatchesFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        const localStorageData = localStorage.getItem(key);
        if (localStorageData) {
          setMatches(JSON.parse(localStorageData));
        }
      }
    };

    const fetchMatches = async () => {
      setIsLoading(true);
      const scrapedMatches = await fetchMatchesForMonthYear(
        selectedMonth,
        selectedYear
      );
      // Reverse here to ensure the order is correct before saving to state and localStorage
      const matchesInCorrectOrder = scrapedMatches;
      setMatches(matchesInCorrectOrder);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(matchesInCorrectOrder));
      }
      setIsLoading(false);
    };

    loadMatchesFromLocalStorage();
    fetchMatches();
  }, [selectedMonth, selectedYear]);

  return {
    matches,
    selectedMonth,
    selectedYear,
    setMonth: setSelectedMonth,
    setYear: setSelectedYear,
    isLoading: getIsLoading,
  };
};

export default useMatches;
