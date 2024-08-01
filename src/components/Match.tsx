import React from "react";
import "./Match.css";
import { getFormattedLeagueIcon } from "./MatchDetails";

interface MatchProps {
  day: number;
  team_name: string;
  time: string;
  leagueName: string;
  leagueIcon: string;
  teamLogo: string;
  field: string;
  onClick: () => void;
}

export const getMatchFieldDisplay = (field: string) => {
  switch (field) {
    case "(C)":
      return "casa";
    case "(F)":
      return "fora";
    default:
      return "neutro";
  }
};

const Match: React.FC<MatchProps> = ({
  day,
  team_name,
  time,
  leagueName,
  leagueIcon,
  teamLogo,
  field,
  onClick,
}) => {
  return (
    <div className={`match`} onClick={undefined}>
      <div className="match-day">{day}</div>
      <div className="match-description">
        <div className="match-team">{team_name.toUpperCase()}</div>
        <img src={teamLogo} alt="team logo" className="team-logo" />
      </div>
      <div className="match-time">
        <div className="match-time-text">{time}</div>
      </div>
      <div className="match-fill">
        <div className="match-type">
          <img
            src={getFormattedLeagueIcon(leagueIcon)}
            alt={leagueName}
            className="match-league-icon"
          />
          {leagueName.toUpperCase()}
        </div>
      </div>
      <div className="match-field">
        <div className="match-field-text">
          {getMatchFieldDisplay(field).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default Match;
