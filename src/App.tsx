import React, { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import MatchList from "./components/MatchList";
import Footer from "./components/Footer";
import useMatches from "./hooks/useMatches";
import useBackgroundImage from "./hooks/useBackgroundImage";
import "./App.css";
import { MatchInfo } from "./components/utils/scrapeSportingMatches2";
import MatchDetails from "./components/MatchDetails";
import Skeleton from "react-loading-skeleton";

const App: React.FC = () => {
const { backgroundImageUrl, fetchBackgroundImage } = useBackgroundImage();
const [currentMonth, setCurrentMonth] = useState<number>(
  new Date().getMonth() + 1
);
  const { matches, selectedMonth, selectedYear, setMonth, setYear, isLoading } =
    useMatches();
  const [selectedMatch, setSelectedMatch] = useState<MatchInfo | null>(null);
  const [numberOfColumns, setNumberOfColumns] = useState(1);
  const handleMonthChange = (newMonth: number) => {
    setCurrentMonth(newMonth);
    fetchBackgroundImage();
  };
  const handleMatchClick = (match: MatchInfo) => {
    setSelectedMatch(match);
  };
  const handleColumnChange = useCallback((columns: number) => {
    setNumberOfColumns(columns);
  }, []);

  return (
    <React.StrictMode>
      <div className="App">
        <div className="container">
          <div
            className="background"
            style={{
              backgroundImage: `url(${
                numberOfColumns > 1 ? "estadio.png" : backgroundImageUrl
              })`,
            }}
          />
          <Header
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setMonth={setMonth}
            setYear={setYear}
            onMonthChange={handleMonthChange}
          />
          <main className="content">
            {isLoading ? (
              <div className={`match-list-container-1`} style={{ zIndex: 1 }}>
                <div className="column">
                  <div className="skeleton_match" />
                  <div className="skeleton_match" />
                  <div className="skeleton_match" />
                </div>
              </div>
            ) : selectedMatch ? (
              <MatchDetails
                match={selectedMatch}
                onBack={() => setSelectedMatch(null)}
              />
            ) : (
              <MatchList
                matches={matches}
                onColumnChange={handleColumnChange}
                onMatchClick={handleMatchClick}
              />
            )}
          </main>
          <Footer />
        </div>
      </div>
    </React.StrictMode>
  );
};

export default App;
