import React, { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import pt from "date-fns/locale/pt";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./CartazNSCPMPage.css";

interface Team {
  name: string;
  logo: string;
}

interface Match {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  result: string;
  leagueName: string;
  leagueIcon: string;
  stadium: string;
  jornada: string;
}

const CartazNSCPMPage: React.FC = () => {
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
  }, []);

  const selectMatch = (match: Match, teamsData: Team[] = teams) => {
    setSelectedMatch(match);

    // Find team logos
    const home = teamsData.find((t) => t.name === match.homeTeam);
    const away = teamsData.find((t) => t.name === match.awayTeam);

    if (home) setHomeTeam(home);
    if (away) setAwayTeam(away);

    // Update sporting position
    if (match.homeTeam === "Sporting") {
      setWhereSportingPlays(1);
    } else if (match.awayTeam === "Sporting") {
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
  };

  const formatDateString = (date: Date | null, time?: string): string => {
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
    const sorted = [...matches].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const grouped: { [key: string]: Match[] } = {};

    sorted.forEach((match) => {
      const date = new Date(match.date);
      const monthYear = date.toLocaleDateString('pt-PT', {
        month: 'long',
        year: 'numeric'
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(match);
    });

    return grouped;
  };

  const groupedMatches = groupMatchesByMonth();

  const handleLeagueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeagueInputValue(e.target.value);
  };

  const handleStadiumChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    setStadiumValue(e.currentTarget.textContent || "");
  };

  return (
    <div className="main-container">
      <div className="backgroundImg">
        {/* <div className="background-special" /> */}
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
        <div className="background-tint">
          <div className="league-logo">
            {}
            {leagueInputValue.includes("Taça de Portugal".toUpperCase()) && (
              <div className="taca-portugal" />
            )}
            {leagueInputValue.includes("Taça da Liga".toUpperCase()) && (
              <div className="taca-liga" />
            )}
            {leagueInputValue.includes("Campeões".toUpperCase()) && (
              <div className="liga-campeoes">
                <div className="liga-campeoes-logo" />
                <div className="blue" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="main-content">
        <div className="content-container">
          <div className="league-name">
            <input
              spellCheck={false}
              type="text"
              className="league-input"
              defaultValue={"Taça de Portugal 24/25 | 4ª Eliminatória"}
              value={leagueInputValue.toUpperCase()}
              onChange={handleLeagueInputChange}
            />
          </div>
          <div className="team-names-container">
            {whereSportingPlays == 1 ? (
              <div className="team-top-container">
                <div className="team-text sporting-label"></div>
                <div className="team-text">
                  <div className="vs">vs</div>
                  <div className="generic-label">
                    {awayTeam?.name.toUpperCase()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="team-top-container">
                <div className="team-text">
                  <div className="generic-label">
                    {homeTeam?.name.toUpperCase()}
                  </div>
                  <div className="vs">vs</div>
                </div>
                <div className="team-text sporting-label"></div>
              </div>
            )}
          </div>
          <div className="logo-container" onClick={toggleDropdown}>
            <div
              className="home-logo"
              style={{ backgroundImage: `url(${homeTeam?.logo})` }}
            />
            <div
              className="away-logo"
              style={{ backgroundImage: `url(${awayTeam?.logo})` }}
            />
            <div className="logo-hover-overlay">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="logo-hover-text">MUDAR JOGO</div>
            </div>
          </div>
          <div className="match-date">
            <input
              spellCheck={false}
              className="date-text"
              value={currentDate}
              onChange={(e) => {}}
              placeholder={currentDate}
            />
          </div>

          {/* <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            dateFormat={"dd MMMM '|' HH'H'mm"}
            locale="pt-PT"
            className="date-picker date-text"
          /> */}
          <div
            className={`centered-text stadium-text`}
            contentEditable="true"
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ __html: stadiumValue }}
          />
          <div
            className="sandwiched-text"
            contentEditable="true"
            suppressContentEditableWarning={true}
          >
            VEM ASSISTIR NO NÚCLEO
          </div>
          {/* <div className="special-text" contentEditable="true">
            <p
              style={{
                fontFamily: "DIN Web W07 Cond Bold",
                fontSize: "large",
                width: "80%",
                margin: "0 auto",
              }}
            >
              {" "}
              NO OUTRO DIA, EU FUI A BRAGA, VI UM TREINADOR QUE ME AGRADAVA, NÃO
              TINHA CURSO, NÃO ME IMPORTEI, DEI 10 MILHÕES POR MBWAY
            </p>
            <p
              style={{
                fontFamily: "DIN Web W07 Black",
                fontSize: "larger",
                width: "100%",
                marginTop: "10px",
              }}
            >
              RÚBEN AMORIM, RÚBEN AMORIM, RÚBEN AMORIM
            </p>
          </div> */}
        </div>
      </div>
      {isDropdownVisible && matches.length > 0 && (
        <>
          <div className="modal-overlay" onClick={toggleDropdown} />
          <div className="match-modal">
            <div className="modal-header">
              <h2>Selecionar Jogo</h2>
              <button className="modal-close" onClick={toggleDropdown}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              {Object.entries(groupedMatches).map(([monthYear, monthMatches]) => (
                <div key={monthYear} className="month-group">
                  <div className="month-divider">{monthYear.toUpperCase()}</div>
                  <div className="match-grid">
                    {monthMatches.map((match, index) => (
                      <div
                        key={index}
                        className={`match-item ${
                          selectedMatch === match ? "selected" : ""
                        }`}
                        onClick={() => handleMatchSelect(match)}
                      >
                        <div className="match-item-header">
                          <div className="match-day">
                            {new Date(match.date).getDate()}
                          </div>
                          <div className="match-time">
                            {match.time && match.time !== "TBD" ? match.time : "TBD"}
                          </div>
                        </div>
                        <div className="match-versus">
                          <div className="match-home">{match.homeTeam}</div>
                          <div className="vs-divider">vs</div>
                          <div className="match-away">{match.awayTeam}</div>
                        </div>
                        <div className="match-league-name">{match.leagueName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
};

export default CartazNSCPMPage;
