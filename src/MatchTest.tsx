import React, { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import pt from "date-fns/locale/pt";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./MatchTest.css";

interface Team {
  name: string;
  logo: string;
}

const MatchTestPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHomeDropdownVisible, setHomeDropdownVisible] = useState(false);
  const [isAwayDropdownVisible, setAwayDropdownVisible] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [whereSportingPlays, setWhereSportingPlays] = useState<number>(1);
  const [leagueInputValue, setLeagueInputValue] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/teams.json");
        if (!response.ok) {
          throw new Error("teams.json not found");
        }
        const data = await response.json();
        setTeams(data);
        setHomeTeam(data[0]);
        setAwayTeam(data[0]);
      } catch (error) {
        console.error("Error loading teams:", error);
      }
    };

    fetchTeams();
  }, []);

  const formatDateString = (date: Date | null): string => {
    if (!date) return "";
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
  };

  const currentDate = formatDateString(selectedDate);

  const toggleHomeDropdown = () => {
    setHomeDropdownVisible(!isHomeDropdownVisible);
    setAwayDropdownVisible(!isAwayDropdownVisible);
  };

  const toggleAwayDropdown = () => {
    setHomeDropdownVisible(!isHomeDropdownVisible);
    setAwayDropdownVisible(!isAwayDropdownVisible);
  };

  const handleHomeTeamSelect = (team: Team) => {
    setHomeTeam(team);
    updateWhereSportingPlays(team, awayTeam);
  };

  const handleAwayTeamSelect = (team: Team) => {
    setAwayTeam(team);
    updateWhereSportingPlays(homeTeam, team);
  };

  const updateWhereSportingPlays = (home: Team | null, away: Team | null) => {
    if (home && home.name === "Sporting CP") {
      setWhereSportingPlays(1);
    } else if (away && away.name === "Sporting CP") {
      setWhereSportingPlays(2);
    }
  };

  const handleLeagueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeagueInputValue(e.target.value);
  };

  return (
    <div>
      <div className="backgroundImg">
        {/* <div className="background-special" /> */}
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
          <div className="logo-container">
            <div
              className="home-logo"
              style={{ backgroundImage: `url(${homeTeam?.logo})` }}
              onClick={toggleHomeDropdown}
            />
            <div
              className="away-logo"
              style={{ backgroundImage: `url(${awayTeam?.logo})` }}
              onClick={toggleAwayDropdown}
            />
          </div>
          <div className="dropdown-container">
            {isHomeDropdownVisible && teams.length > 0 && (
              <select
                className="dropdown"
                defaultValue={homeTeam?.name || "Sporting CP"}
                onChange={(e) => {
                  const selectedTeam = teams.find(
                    (team) => team.name === e.target.value
                  );
                  if (selectedTeam) {
                    handleHomeTeamSelect(selectedTeam);
                  }
                }}
              >
                {teams.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
            {isAwayDropdownVisible && teams.length > 0 && (
              <select
                className="dropdown"
                defaultValue={awayTeam?.name || "Sporting CP"}
                onChange={(e) => {
                  const selectedTeam = teams.find(
                    (team) => team.name === e.target.value
                  );
                  if (selectedTeam) {
                    handleAwayTeamSelect(selectedTeam);
                  }
                }}
              >
                {teams.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="match-date">
            <input
              spellCheck={false}
              className="date-text"
              defaultValue={currentDate}
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
          <div className={`centered-text stadium-text`} contentEditable="true">
            Estádio José de Alvalade
          </div>
          <div className="sandwiched-text" contentEditable="true">
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
      <Footer />
    </div>
  );
};

export default MatchTestPage;
