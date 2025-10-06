import React from "react";
import Icon, { IconName } from "../Icon";
import "./Tooltip.css";

interface TooltipProps {
  icon: IconName;
  text: string;
  position?: "center" | "top";
  className?: string;
  onClick?: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({
  icon,
  text,
  position = "center",
  className = "",
  onClick,
}) => {
  return (
    <div
      className={`hover-tooltip ${position === "top" ? "tooltip-top" : ""} ${
        onClick ? "tooltip-clickable" : ""
      } ${className}`}
      onClick={onClick}
    >
      <Icon name={icon} size={40} />
      <div className="hover-tooltip-text">{text}</div>
    </div>
  );
};

export default Tooltip;
