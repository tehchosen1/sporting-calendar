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

const Match: React.FC<MatchProps> = ({ day, team_name, time, extraInfo, teamLogo, field }) => {
  return (
    <div className="match">
      <div className="match-day">{day}</div>
      <div className="match-description">
        <div className="block">
          <div className="match-team">{team_name.toUpperCase()}</div>
          <img src={teamLogo} alt="team logo" className="team-logo" />
        </div>
      </div>
      <div className="match-time">{time}</div>
      <div className="match-fill">
        <div className="match-type">{extraInfo.toUpperCase()}</div>
      </div>
      <div className="match-field">
        <div className="match-field-text">{field.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default Match;
