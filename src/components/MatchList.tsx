import React from "react";
import Match from "./Match";
import "./MatchList.css";
import { MatchInfo } from "./utils/scrapeSportingMatches";

interface MatchListProps {
  matches: MatchInfo[];
}

const MatchList: React.FC<MatchListProps> = ({ matches }) => {
  return (
    <div className="match-list">
      {matches.map((match, index) => (
        <Match
          key={index}
          day={new Date(match.date).getDate()}
          team_name={match.teamName}
          time={match.time}
          extraInfo={match.leagueName}
          teamLogo={match.teamIcon}
          field={match.field}
        />
      ))}
    </div>
  );
};

export default MatchList;
