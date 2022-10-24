import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Root from './Root'
import Home from './Home'



const Rout = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="graph" element={<Root />} />
      </Routes>
    </Router>
  );
}

export default Rout;