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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      } else if (match.awayTeam === "Sporting" || match.awayTeam === "Sporting CP") {
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
      <div className="backgroundImg">
        <div className="background-tooltips">
          <Tooltip icon="upload" text="MUDAR FUNDO" onClick={() => {}} />
          <Tooltip icon="capture" text="CAPTURAR IMAGEM" onClick={() => {}} />
        </div>
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
          <EditableText
            value="VEM ASSISTIR NO NÚCLEO"
            variant="sandwiched"
          />
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
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
