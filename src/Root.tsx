import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import CartazNSCPMPage from "./pages/nscpm/nscpm";
import CartazNSCPBPage from "./pages/nscpb/nscpb";

const Root: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" Component={App} />
      <Route path="/cartaz-nscpm" Component={CartazNSCPMPage} />
      <Route path="/cartaz-nscpb" Component={CartazNSCPBPage} />
    </Routes>
  </Router>
);

export default Root;
