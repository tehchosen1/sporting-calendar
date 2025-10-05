import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import CartazNSCPMPage from "./CartazNSCPMPage";

const Root: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" Component={App} />
      <Route path="/cartaz-nscpm" Component={CartazNSCPMPage} />
    </Routes>
  </Router>
);

export default Root;
