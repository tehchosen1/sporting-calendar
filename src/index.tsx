import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import Footer from "./components/Footer";
import Tooltip from "./components/ui/Tooltip";
import Modal from "./components/ui/Modal";
import TeamLogo from "./components/branding/TeamLogo";
import LeagueBadge from "./components/branding/LeagueBadge";
import MonthGroup from "./components/match/MonthGroup";
import TeamVersusDisplay from "./components/match/TeamVersusDisplay";
import EditableText from "./components/ui/EditableText";
import { Team, Match } from "./types";
import randomQuotes from "./random_quotes.json";
import domtoimage from "dom-to-image";
import "./index.css";

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [whereSportingPlays, setWhereSportingPlays] = useState<number>(1);
  const [leagueInputValue, setLeagueInputValue] = useState("");
  const [stadiumValue, setStadiumValue] = useState("Estádio José de Alvalade");
  const [isFooterHovered, setIsFooterHovered] = useState(false);
  const [randomQuote, setRandomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * randomQuotes.length);
    return randomQuotes[randomIndex];
  });
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [showFlash, setShowFlash] = useState(false);
  const [hideTooltips, setHideTooltips] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * randomQuotes.length);
    return randomQuotes[randomIndex];
  };

  const handleRefreshQuote = () => {
    setRandomQuote(getRandomQuote());
  };

  const handleFooterHoverChange = (isHovered: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (isHovered) {
      setIsFooterHovered(true);
    } else {
      // Add a small delay before hiding to allow moving to tooltip
      hoverTimeoutRef.current = setTimeout(() => {
        setIsFooterHovered(false);
      }, 100);
    }
  };

  const handleBackgroundUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureImage = async () => {
    const mainContainer = document.querySelector(
      ".main-container"
    ) as HTMLElement;
    if (!mainContainer) return;

    // Hide tooltips
    setHideTooltips(true);

    // Wait for state update
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Show flash animation
    setShowFlash(true);

    // Wait for flash animation to complete (300ms total)
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Hide flash before capture
    setShowFlash(false);

    // Wait a bit for flash to be fully hidden
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // Get current container width
      const currentWidth = mainContainer.offsetWidth;

      // Capture the full page
      const dataUrl = await domtoimage.toPng(mainContainer, {
        height: 1024,
      });

      // If width is greater than 768px, crop it
      if (currentWidth > 768) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 768;
          canvas.height = 1024;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // Calculate crop offset to center the image
            const cropX = (currentWidth - 768) / 2;

            // Draw the cropped image (centered)
            ctx.drawImage(
              img,
              cropX, // source x (crop from center)
              0, // source y
              768, // source width
              1024, // source height
              0, // dest x
              0, // dest y
              768, // dest width
              1024 // dest height
            );

            // Download the cropped image
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.download = `sporting-calendar-${new Date().getTime()}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
              }
            });
          }
        };
        img.src = dataUrl;
      } else {
        // Width is already <= 768px, download as is
        const link = document.createElement("a");
        link.download = `sporting-calendar-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Error capturing image:", error);
    }

    // Show tooltips again
    setHideTooltips(false);
  };

  const selectMatch = useCallback(
    (match: Match, teamsData: Team[] = teams) => {
      setSelectedMatch(match);

      // Find team logos
      const home = teamsData.find((t) => t.name === match.homeTeam);
      const away = teamsData.find((t) => t.name === match.awayTeam);

      if (home) setHomeTeam(home);
      if (away) setAwayTeam(away);

      // Update sporting position
      if (match.homeTeam === "Sporting" || match.homeTeam === "Sporting CP") {
        setWhereSportingPlays(1);
      } else if (
        match.awayTeam === "Sporting" ||
        match.awayTeam === "Sporting CP"
      ) {
        setWhereSportingPlays(2);
      }

      // Update league name with jornada if available
      const leagueText = match.jornada
        ? `${match.leagueName} | ${match.jornada}`
        : match.leagueName;
      setLeagueInputValue(leagueText);

      // Update stadium
      setStadiumValue(match.stadium);

      // Update date with time
      const dateTime = new Date(match.date);
      if (match.time && match.time !== "TBD") {
        const [hours, minutes] = match.time.split(":");
        dateTime.setHours(parseInt(hours), parseInt(minutes));
      }
      setSelectedDate(dateTime);
    },
    [teams]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsResponse, matchesResponse] = await Promise.all([
          fetch("/teams.json"),
          fetch("/matches.json"),
        ]);

        if (!teamsResponse.ok) throw new Error("teams.json not found");
        if (!matchesResponse.ok) throw new Error("matches.json not found");

        const teamsData = await teamsResponse.json();
        const matchesData = await matchesResponse.json();

        setTeams(teamsData);
        setMatches(matchesData);

        // Set initial teams
        if (teamsData.length > 0) {
          setHomeTeam(teamsData[0]);
          setAwayTeam(teamsData[0]);
        }

        // Set initial match if available
        if (matchesData.length > 0) {
          selectMatch(matchesData[0], teamsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateString = (date: Date | null): string => {
    if (!date) return "";

    // Check if time is available (not TBD and not empty)
    const hasValidTime =
      selectedMatch?.time &&
      selectedMatch.time !== "TBD" &&
      selectedMatch.time !== "";

    if (hasValidTime) {
      return date
        .toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace("de ", " ")
        .toUpperCase()
        .replace("ÀS", " | ")
        .replace(":", "H");
    } else {
      return (
        date
          .toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "long",
          })
          .replace("de ", " ")
          .toUpperCase() + " | A DEFINIR"
      );
    }
  };

  const currentDate = formatDateString(selectedDate);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleMatchSelect = (match: Match) => {
    selectMatch(match);
    setDropdownVisible(false);
  };

  // Group matches by month and sort by date
  const groupMatchesByMonth = () => {
    const sorted = [...matches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const grouped: { [key: string]: Match[] } = {};

    sorted.forEach((match) => {
      const date = new Date(match.date);
      const monthYear = date.toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(match);
    });

    return grouped;
  };

  const groupedMatches = groupMatchesByMonth();

  return (
    <div className="main-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      <div
        className="backgroundImg"
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "auto 125vh",
                backgroundPosition: "center center",
              }
            : undefined
        }
      >
        {!hideTooltips && (
          <div className="background-tooltips">
            <Tooltip
              icon="upload"
              text="MUDAR FUNDO"
              onClick={handleBackgroundUpload}
            />
            <Tooltip
              icon="capture"
              text="CAPTURAR IMAGEM"
              onClick={handleCaptureImage}
            />
          </div>
        )}
        {((homeTeam?.name === "Sporting CP" &&
          (awayTeam?.name === "Benfica" || awayTeam?.name === "FC Porto")) ||
          (awayTeam?.name === "Sporting CP" &&
            (homeTeam?.name === "Benfica" ||
              homeTeam?.name === "FC Porto"))) && (
          <>
            {homeTeam?.name === "Sporting CP" ? (
              <>
                <div className="gyokeres gyokeres-left" />
                {awayTeam?.name === "Benfica" ? (
                  <div className="foe-1 foe-right" />
                ) : (
                  <div className="foe-2 foe-right" />
                )}
              </>
            ) : (
              <>
                {homeTeam?.name === "Benfica" ? (
                  <div className="foe-1 foe-left" />
                ) : (
                  <div className="foe-2 foe-left" />
                )}
                <div className="gyokeres gyokeres-right" />
              </>
            )}
          </>
        )}
        <div className="background-tint-black" />
        <div className="background-tint" />
      </div>
      <LeagueBadge leagueName={leagueInputValue} />
      <div className="main-content">
        <div className="content-container">
          <div className="league-name">
            <EditableText
              value={leagueInputValue.toUpperCase()}
              onChange={setLeagueInputValue}
              variant="league"
            />
          </div>
          <TeamVersusDisplay
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            sportingPosition={whereSportingPlays}
          />
          <div className="logo-container">
            <TeamLogo team={homeTeam} position="home" />
            <TeamLogo team={awayTeam} position="away" />
            <Tooltip icon="swap" text="MUDAR JOGO" onClick={toggleDropdown} />
          </div>
          <div className="match-date">
            <EditableText
              value={currentDate}
              variant="date"
              readOnly
              placeholder={currentDate}
            />
          </div>

          <EditableText
            value={stadiumValue}
            variant="contentEditable"
            className="stadium-text"
          />
          <EditableText value="VEM ASSISTIR NO NÚCLEO" variant="sandwiched" />
        </div>
      </div>
      <Modal
        title="Selecionar Jogo"
        isOpen={isDropdownVisible && matches.length > 0}
        onClose={toggleDropdown}
      >
        {Object.entries(groupedMatches).map(([monthYear, monthMatches]) => (
          <MonthGroup
            key={monthYear}
            monthYear={monthYear}
            matches={monthMatches}
            selectedMatch={selectedMatch}
            onMatchSelect={handleMatchSelect}
          />
        ))}
      </Modal>
      <Footer
        randomQuote={randomQuote}
        onHoverChange={handleFooterHoverChange}
        onRefresh={handleRefreshQuote}
      />
      {isFooterHovered && (
        <div
          className="footer-tooltip-wrapper"
          onMouseEnter={() => handleFooterHoverChange(true)}
          onMouseLeave={() => handleFooterHoverChange(false)}
        >
          <Tooltip
            icon="refresh"
            text="GERAR NOVA FRASE"
            onClick={handleRefreshQuote}
          />
        </div>
      )}
      {showFlash && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            zIndex: 10000,
            animation: "flash 0.3s ease-out",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
