import React from "react";
import { Match } from "../../../types";
import "./MatchCard.css";

interface MatchCardProps {
  match: Match;
  isSelected?: boolean;
  onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      className={`match-item ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="match-item-header">
        <div className="match-day">{new Date(match.date).getDate()}</div>
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
  );
};

export default MatchCard;
