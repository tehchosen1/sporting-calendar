import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import MatchTest from "./MatchTest";

const Root: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" Component={App} />
      <Route path="/match-test" Component={MatchTest} />
    </Routes>
  </Router>
);

export default Root;
