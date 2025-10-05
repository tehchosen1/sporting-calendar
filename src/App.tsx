import React, { useCallback, useState } from "react";
import Header from "./components/Header";
import MatchList from "./components/MatchList";
import Footer from "./components/Footer";
import useMatches from "./hooks/useMatches";
import useBackgroundImage from "./hooks/useBackgroundImage";
import useStadiumBackground from "./hooks/useStadiumBackground";
import "./App.css";
import { MatchInfo } from "./components/utils/scrapeSportingMatches";
import MatchDetails from "./components/MatchDetails";

const App: React.FC = () => {
const { backgroundImageUrl, fetchBackgroundImage } = useBackgroundImage();
  const { matches, selectedMonth, selectedYear, setMonth, setYear, isLoading } =
    useMatches();
  const [selectedMatch, setSelectedMatch] = useState<MatchInfo | null>(null);
  const [hoveredMatch, setHoveredMatch] = useState<MatchInfo | null>(null);
  const [numberOfColumns, setNumberOfColumns] = useState(1);

  // Determine home team from hovered or selected match
  const currentHomeTeam = React.useMemo(() => {
    const match = hoveredMatch || selectedMatch;
    if (!match) return null;

    console.log("[App] Match data:", {
      teamName: match.teamName,
      field: match.field,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
    });

    // If homeTeam is explicitly set in the match data, use it
    if (match.homeTeam) {
      console.log("[App] Using explicit homeTeam:", match.homeTeam);
      return match.homeTeam;
    }

    // Otherwise, determine from field indicator
    // (C) means casa (home), so Sporting is home
    // (F) means fora (away), so opponent is home
    let homeTeam = null;
    if (match.field === "(C)") {
      homeTeam = "Sporting";
    } else if (match.field === "(F)") {
      homeTeam = match.teamName;
    }

    console.log("[App] Determined home team from field:", {
      field: match.field,
      homeTeam,
    });

    return homeTeam;
  }, [hoveredMatch, selectedMatch]);

  const { stadiumImageUrl } = useStadiumBackground(currentHomeTeam);

  const handleMonthChange = () => {
    fetchBackgroundImage();
  };
  const handleMatchClick = (match: MatchInfo) => {
    setSelectedMatch(match);
  };
  const handleMatchHover = (match: MatchInfo | null) => {
    setHoveredMatch(match);
  };
  const handleColumnChange = useCallback((columns: number) => {
    setNumberOfColumns(columns);
  }, []);

  // Determine which background to use
  const currentBackgroundUrl = React.useMemo(() => {
    console.log("[App] Determining background URL:", {
      stadiumImageUrl,
      numberOfColumns,
      backgroundImageUrl,
    });

    // Use stadium image if available (from hover or selection)
    if (stadiumImageUrl) {
      console.log("[App] Using stadium image:", stadiumImageUrl);
      return stadiumImageUrl;
    }

    // Fall back to default backgrounds
    if (numberOfColumns > 1) {
      console.log("[App] Using multi-column default");
      return "estadio.png";
    }

    console.log("[App] Using default background:", backgroundImageUrl);
    return backgroundImageUrl;
  }, [stadiumImageUrl, numberOfColumns, backgroundImageUrl]);

  return (
    <React.StrictMode>
      <div className="App">
        <div className="container">
          {/* Debug info - remove in production */}
          <div
            style={{
              position: "fixed",
              top: 10,
              right: 10,
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "10px",
              fontSize: "12px",
              zIndex: 9999,
              maxWidth: "300px",
              wordBreak: "break-all",
            }}
          >
            <div>Home Team: {currentHomeTeam || "none"}</div>
            <div>Stadium URL: {stadiumImageUrl ? "✓" : "✗"}</div>
            <div style={{ fontSize: "10px" }}>
              {stadiumImageUrl?.substring(0, 50)}...
            </div>
          </div>

          <div
            className="background"
            style={{
              backgroundImage: `url(${currentBackgroundUrl})`,
              transition: "background-image 0.3s ease-in-out",
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
                onMatchHover={handleMatchHover}
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
