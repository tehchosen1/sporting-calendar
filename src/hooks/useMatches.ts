import { useState, useEffect } from "react";
import fetchMatchesForMonthYear, { MatchInfo } from "../components/utils/scrapeSportingMatches";

const useMatches = () => {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const key = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;
  
    const loadMatchesFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        const localStorageData = localStorage.getItem(key);
        if (localStorageData) {
          setMatches(JSON.parse(localStorageData).reverse());
        }
      }
    };
  
    const fetchMatches = async () => {
      const scrapedMatches = await fetchMatchesForMonthYear(selectedMonth, selectedYear);
      setMatches(scrapedMatches.reverse());
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(scrapedMatches));
      }
    };
  
    loadMatchesFromLocalStorage();
    fetchMatches();
  }, [selectedMonth, selectedYear]);

  return { matches, selectedMonth, selectedYear, setMonth: setSelectedMonth, setYear: setSelectedYear };
};

export default useMatches;
