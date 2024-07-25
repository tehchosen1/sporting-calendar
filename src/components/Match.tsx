import React from "react";
import "./Match.css";

interface MatchProps {
  day: number;
  team_name: string;
  time: string;
  extraInfo: string;
  teamLogo: string;
  field: string;
}

const getMatchFieldDisplay = (field: string) => {
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
  extraInfo,
  teamLogo,
  field,
}) => {
  return (
    <div className="match">
      <div className="match-day">{day}</div>
      <div className="match-description">
        <div className="block">
          <div className="match-team">{team_name.toUpperCase()}</div>
          <img src={teamLogo} alt="team logo" className="team-logo" />
        </div>
      </div>
      <div className="match-time">
        <div className="match-time-text">{time}</div>
      </div>
      <div className="match-fill">
        <div className="match-type">{extraInfo.toUpperCase()}</div>
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
