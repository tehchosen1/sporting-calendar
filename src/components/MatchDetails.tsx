import React, { useEffect, useState } from "react";
import { MatchInfo } from "./utils/scrapeSportingMatches2";
import "./MatchDetails.css";
import { getMatchFieldDisplay } from "./Match";
import { FastAverageColor } from "fast-average-color";

interface MatchDetailsProps {
  match: MatchInfo;
  onBack: () => void;
}

export interface Color {
  value: number[];
  rgb: string;
  rgba: string;
  hex: string;
  hexa: string;
  isDark: boolean;
  isLight: boolean;
}

const sportingLogo = "../../icon_emblema.svg";

export const getFormattedLeagueIcon = (leagueIcon: string) => {
  const parts = leagueIcon.split("/");
  let filename = parts.pop() || "";
  filename = decodeURIComponent(filename).replace(/\//g, "_");
  filename = encodeURIComponent(filename);
  const formattedPath = [...parts, filename].join("/");
  return formattedPath;
};

const renderSporting = () => {
  return (
    <div className={`team-container-sporting`}>
      <span className="match-team-name">{"Sporting CP".toUpperCase()}</span>
      <img
        src={sportingLogo}
        alt="Sporting CP"
        className={`match-team-logo-sporting`}
      />
    </div>
  );
};

const matchTeam = (match: MatchInfo) => {
  return (
    <div className={`team-container-other`}>
      <img
        src={match.teamIcon}
        alt={match.teamName}
        className={`match-team-logo-other`}
      />
      <span className="match-team-name">{match.teamName.toUpperCase()}</span>
    </div>
  );
};

const MatchDetails: React.FC<MatchDetailsProps> = ({ match, onBack }) => {
  return (
    <div className="match-details">
      <div className="match-team-container">
        <div className="match-teams">
          {matchTeam(match)}
          {renderSporting()}
        </div>
        <span className="versus">VS</span>
      </div>

      <div className="match-details-extra">
        <div className="match-details-time">
          <div className="match-details-time-text">{match.time}</div>
          <div className="match-details-day">{match.date}</div>
        </div>
      </div>
      <div className="match-details-fill">
        <img
          src={getFormattedLeagueIcon(match.leagueIcon)}
          alt={match.leagueName}
          className="match-details-league-icon"
        />
        <div className="match-details-field">
          <div className="match-details-field-text">
            {getMatchFieldDisplay(match.field).toUpperCase() == "NEUTRO"
              ? ""
              : getMatchFieldDisplay(match.field).toUpperCase()}
          </div>
        </div>
      </div>

      <button className="back-button" onClick={onBack}>
        Back to Match List
      </button>
    </div>
  );
};

export default MatchDetails;
