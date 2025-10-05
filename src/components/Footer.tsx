// Import the JSON data
import randomQuotes from "../random_quotes.json"; // Update the path based on your file structure
import React, { useState } from "react";
import "./Footer.css";

let textAssistir = `Vem assistir no`;
let textMinde = "Núcleo Sportinguista de Minde";

// Function to select a random quote
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * randomQuotes.length);
  return randomQuotes[randomIndex];
};

const Footer: React.FC = () => {
  const [randomTxt, setRandomTxt] = useState(getRandomQuote());

  const handleRefresh = () => {
    setRandomTxt(getRandomQuote());
  };

  return (
    <footer className="footer" onClick={handleRefresh}>
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
            <div className="footer-text-minde">{textMinde.toUpperCase()}</div>
            <div className="footer-text-random">{randomTxt.toUpperCase()}</div>
          </div>
        </div>
        <div className="footer-refresh-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5M21 10V4M21 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="footer-refresh-text">GERAR NOVA FRASE</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
