import React from "react";
import Header from "./components/Header";
import MatchList from "./components/MatchList";
import Footer from "./components/Footer";
import useMatches from "./hooks/useMatches";
import useBackgroundImage from "./hooks/useBackgroundImage";
import "./App.css";

const App: React.FC = () => {
  const backgroundImageUrl = useBackgroundImage();
  const { matches, selectedMonth, selectedYear, setMonth, setYear, isLoading } =
    useMatches();

  return (
    <React.StrictMode>
      <div className="App">
        <div className="container">
          <div
            className="background"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <Header
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setMonth={setMonth}
            setYear={setYear}
          />
          <main className="content">
            {isLoading ? (
              <div
                className="loading"
                style={{
                  color: "white",
                  fontFamily: "kenyan coffee rg",
                  width: "100%",
                  height: "100%",
                  fontSize: "3rem",
                  textAlign: "center",
                  zIndex: 1000,
                  textShadow: "rgba(0, 0, 0, 0.15) 2px 2px 0px",
                }}
              >
                Carregando jogos...
              </div>
            ) : (
              <MatchList matches={matches} />
            )}
          </main>
          <Footer />
        </div>
      </div>
    </React.StrictMode>
  );
};

export default App;
