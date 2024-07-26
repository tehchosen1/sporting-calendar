import React from "react";
import Match from "./Match";
import "./MatchList.css";
import { MatchInfo } from "./utils/scrapeSportingMatches";

interface MatchListProps {
  matches: MatchInfo[];
}
const MatchList: React.FC<MatchListProps> = ({ matches }) => {
  // Sort matches by day and time
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Group matches into columns of 4
  const columns = [];
  for (let i = 0; i < sortedMatches.length; i += 4) {
    columns.push(sortedMatches.slice(i, i + 4));
  }

  return (
    <div
      className={`match-list-container ${
        columns.length > 1 ? "hasColumns" : ""
      }`}
    >
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="match-column">
          {column.map((match) => (
            <Match
              key={match.date + match.time + match.teamName}
              small={columns.length > 1}
              day={new Date(match.date).getDate()}
              team_name={match.teamName}
              time={match.time}
              extraInfo={match.leagueName}
              teamLogo={match.teamIcon}
              field={match.field}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MatchList;
