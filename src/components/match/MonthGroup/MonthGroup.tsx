import React from "react";
import { Match } from "../../../types";
import MatchCard from "../MatchCard";
import "./MonthGroup.css";

interface MonthGroupProps {
  monthYear: string;
  matches: Match[];
  selectedMatch: Match | null;
  onMatchSelect: (match: Match) => void;
}

const MonthGroup: React.FC<MonthGroupProps> = ({
  monthYear,
  matches,
  selectedMatch,
  onMatchSelect,
}) => {
  return (
    <div className="month-group">
      <div className="month-divider">{monthYear.toUpperCase()}</div>
      <div className="match-grid">
        {matches.map((match, index) => {
          const isSelected =
            selectedMatch?.date === match.date &&
            selectedMatch?.homeTeam === match.homeTeam &&
            selectedMatch?.awayTeam === match.awayTeam;

          return (
            <MatchCard
              key={index}
              match={match}
              isSelected={isSelected}
              onClick={() => onMatchSelect(match)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthGroup;
