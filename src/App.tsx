import React, { useState } from "react";
import Header from "./components/Header";
import MatchList from "./components/MatchList";
import Footer from "./components/Footer";
import useMatches from "./hooks/useMatches";
import useBackgroundImage from "./hooks/useBackgroundImage";
import "./App.css";

const App: React.FC = () => {
  const backgroundImageUrl = useBackgroundImage();
  const { matches, selectedMonth, selectedYear, setMonth, setYear } =
    useMatches();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <React.StrictMode>
      <div className="App">
          <div
            className="background"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <Header
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setMonth={setMonth}
            setYear={setYear}
            onLogoClick={toggleSidebar}
          />
          <div className="container">
            <main>
              <MatchList matches={matches} />
            </main>
          </div>
          <Footer />
        
      </div>
    </React.StrictMode>
  );
};

export default App;
