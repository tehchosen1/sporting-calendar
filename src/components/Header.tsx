import React from "react";
import "./Header.css";

interface HeaderProps {
  selectedMonth: number;
  selectedYear: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedMonth, selectedYear, setMonth, setYear }) => {
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.target.value));
  };

  const renderOptionsForMonth = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
      <option key={month} value={month}>
        {new Intl.DateTimeFormat("pt-PT", { month: "long" })
          .format(new Date(0, month - 1))
          .toString()
          .toUpperCase()}
      </option>
    ));
  };

  const renderOptionsForYear = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ));
  };

  return (
    <header className="header">
      <div className="header-background"></div>
      <div className="header-logo">
        <img src="../../icon_emblema.svg" alt="Núcleo Sporting" />
      </div>
      <div className="header-wrapper">
        <div className="header-text">
          <div className="header-text-flavor">
            CALENDÁRIO <br />DE JOGOS
          </div>
        </div>
        <div className="header-selectors">
          <select
            className="header-month-text"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {renderOptionsForMonth()}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
