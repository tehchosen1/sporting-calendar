import React from "react";
import { Team } from "../../../types";
import "./TeamVersusDisplay.css";

interface TeamVersusDisplayProps {
  homeTeam: Team | null;
  awayTeam: Team | null;
  sportingPosition: number;
}

const TeamVersusDisplay: React.FC<TeamVersusDisplayProps> = ({
  homeTeam,
  awayTeam,
  sportingPosition,
}) => {
  return (
    <div className="team-names-container">
      {sportingPosition === 1 ? (
        <div className="team-top-container">
          <div className="sporting-label"></div>
          <div className="team-versus-wrapper">
            <div className="vs">vs</div>
            <div className="generic-label">
              {awayTeam?.name.toUpperCase()}
            </div>
          </div>
        </div>
      ) : (
        <div className="team-top-container">
          <div className="team-versus-wrapper">
            <div className="generic-label">
              {homeTeam?.name.toUpperCase()}
            </div>
            <div className="vs">vs</div>
          </div>
          <div className="sporting-label"></div>
        </div>
      )}
    </div>
  );
};

export default TeamVersusDisplay;
