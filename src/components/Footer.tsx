import React from "react";
import "./Footer.css";

const TEXT_MINDE = "Núcleo Sportinguista de Minde";

interface FooterProps {
  randomQuote: string;
  onHoverChange?: (isHovered: boolean) => void;
  onRefresh?: () => void;
}

const Footer: React.FC<FooterProps> = ({
  randomQuote,
  onHoverChange,
  onRefresh,
}) => {
  const handleRefresh = () => {
    onRefresh?.();
  };

  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    onHoverChange?.(false);
  };

  return (
    <footer
      className="footer"
      onClick={handleRefresh}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="footer-background">
        <div className="footer-background-green"></div>
        <div className="footer-background-white"></div>
      </div>
      <div className="footer-content">
        <div className="footer-logo">
          <img src="../../scp-minde.svg" alt="Logo" />
        </div>
        <div className="footer-text">
          <div className="footer-text-main">
            <div className="footer-text-minde">{TEXT_MINDE.toUpperCase()}</div>
            <div className="footer-text-random">{randomQuote.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
