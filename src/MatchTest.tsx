import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

const MatchTestPage: React.FC = () => {
  return (
    <div>
      <Header
        selectedMonth={0}
        selectedYear={0}
        setMonth={function (month: number): void {
          throw new Error("Function not implemented.");
        }}
        setYear={function (year: number): void {
          throw new Error("Function not implemented.");
        }}
        onMonthChange={function (newMonth: number): void {
          throw new Error("Function not implemented.");
        }}
      />
      <div className="main-content">{/* Add your content here */}</div>
      <Footer />
    </div>
  );
};

export default MatchTestPage;
