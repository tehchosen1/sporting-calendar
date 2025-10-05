import React, { useEffect } from "react";
import Match from "./Match";
import "./MatchList.css";
import { MatchInfo } from "./utils/scrapeSportingMatches";

interface MatchListProps {
  matches: MatchInfo[];
  onMatchClick: (match: MatchInfo) => void;
  onColumnChange: (column: number) => void;
  onMatchHover?: (match: MatchInfo | null) => void;
}
// src/components/MatchList.tsx

const MatchList: React.FC<MatchListProps> = ({
  matches,
  onMatchClick,
  onColumnChange,
  onMatchHover,
}) => {
  // Sort matches by day and time
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  useEffect(() => {
    const numberOfColumns = sortedMatches.length > 5 ? 2 : 1;
    onColumnChange(numberOfColumns);
  }, [sortedMatches.length, onColumnChange]);

  let column1: MatchInfo[] = [];
  let column2: MatchInfo[] = [];

  if (sortedMatches.length > 5) {
    // Split sorted matches into two columns as evenly as possible
    const half = Math.ceil(sortedMatches.length / 2);
    column1 = sortedMatches.slice(0, half);
    column2 = sortedMatches.slice(half);
  } else {
    column1 = sortedMatches;
  }

  return (
    <div
      className={`match-list-container-${sortedMatches.length > 5 ? "2" : "1"}`}
    >
      <div className="column">
        {column1.map((match) => (
          <Match
            key={match.date + match.time + match.teamName}
            day={new Date(match.date).getDate()}
            team_name={match.teamName}
            time={match.time}
            leagueName={match.leagueName}
            teamLogo={match.teamIcon}
            leagueIcon={match.leagueIcon}
            field={match.field}
            onClick={() => onMatchClick(match)}
            onHover={(isHovering) => onMatchHover?.(isHovering ? match : null)}
          />
        ))}
      </div>
      {sortedMatches.length > 5 && (
        <div className="column">
          {column2.map((match) => (
            <Match
              key={match.date + match.time + match.teamName}
              day={new Date(match.date).getDate()}
              team_name={match.teamName}
              time={match.time}
              leagueName={match.leagueName}
              teamLogo={match.teamIcon}
              leagueIcon={match.leagueIcon}
              field={match.field}
              onClick={() => onMatchClick(match)}
              onHover={(isHovering) => onMatchHover?.(isHovering ? match : null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default MatchList;
