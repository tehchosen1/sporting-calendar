// Import the JSON data
import randomQuotes from "../random_quotes.json"; // Update the path based on your file structure
import React from "react";
import "./Footer.css";

let textAssistir = `Vem assistir no`;
let textMinde = "Núcleo Sportinguista de Minde";

// Function to select a random quote
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * randomQuotes.length);
  return randomQuotes[randomIndex];
};

const Footer: React.FC = () => {
  const randomTxt = getRandomQuote(); // Use the function to get a random quote
  return (
    <footer className="footer">
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
      </div>
    </footer>
  );
};

export default Footer;
