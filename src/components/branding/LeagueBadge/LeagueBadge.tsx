import React from "react";
import "./LeagueBadge.css";

interface LeagueBadgeProps {
  leagueName: string;
}

const LeagueBadge: React.FC<LeagueBadgeProps> = ({ leagueName }) => {
  const upperLeagueName = leagueName.toUpperCase();

  return (
    <div className="league-logo">
      {upperLeagueName.includes("TAÇA DE PORTUGAL") && (
        <div className="taca-portugal" />
      )}
      {upperLeagueName.includes("TAÇA DA LIGA") && (
        <div className="taca-liga" />
      )}
      {(upperLeagueName.includes("CAMPEÕES") ||
        upperLeagueName.includes("CHAMPIONS LEAGUE")) && (
        <div className="liga-campeoes">
          <div className="liga-campeoes-logo" />
        </div>
      )}
    </div>
  );
};

export default LeagueBadge;
