import React from "react";
import { Team } from "../../../types";
import "./TeamLogo.css";

interface TeamLogoProps {
  team: Team | null;
  position: "home" | "away";
  className?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team, position, className = "" }) => {
  if (!team) return null;

  return (
    <div
      className={`team-logo ${position}-logo ${className}`}
      style={{ backgroundImage: `url(${team.logo})` }}
    />
  );
};

export default TeamLogo;
