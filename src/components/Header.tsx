import React from "react";
import "./Header.css";

interface HeaderProps {
  selectedMonth: number;
  selectedYear: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

const calendarText = "Calendário de Futebol";

const Header: React.FC<HeaderProps> = ({ selectedMonth, setMonth }) => {
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(event.target.value));
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

  return (
    <header className="header">
      <div className="header-wrapper">
        <div className="header-logo">
          <img src="../../icon_emblema.svg" alt="Logo" />
        </div>
        <div className="header-text">{calendarText}</div>
        <div className="header-month-selector">
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
