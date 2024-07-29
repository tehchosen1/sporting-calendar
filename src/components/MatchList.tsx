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

  console.log(sortedMatches.length);

  return (
    <div
      className={`match-list-container-${sortedMatches.length > 4 ? "2" : "1"}`}
    >
      {sortedMatches.map((match) =>
        match.result != "-" ? (
          "-"
        ) : (
          <Match
            key={match.date + match.time + match.teamName}
            day={new Date(match.date).getDate()}
            team_name={match.teamName}
            time={match.time}
            extraInfo={match.leagueName}
            teamLogo={match.teamIcon}
            field={match.field}
          />
        )
      )}
    </div>
  );
};

export default MatchList;
