import React from "react";
import { Route, Routes } from "react-router-dom";
import { PlanBuddies } from "./views";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PlanBuddies />} />
    </Routes>
  );
};

export default App;