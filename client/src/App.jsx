import React from "react";
import { Route, Routes } from "react-router-dom";

import Landing from "./pages/Landing";
import NewsInsight from "./pages/NewsInsight";
import TruthAgent from "./pages/TruthAgent";
import MyPort from "./pages/MyPort";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="news" element={<NewsInsight />} />

          <Route path="true" element={<TruthAgent />} />

          <Route path="port" element={<MyPort />} />

        
          
        </Route>
      </Routes>
    
    </>
  );
};

export default App;