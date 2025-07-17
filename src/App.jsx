import { useLayoutEffect, useState } from "react";
import "./css/App.css"
import DisasterDimensions from "./pages/DisasterDimensions";
import Chatbot from "./pages/Chatbot";
import { Routes, Route } from "react-router-dom";
import MoreInfo from "./pages/MoreInfo";
import NavBar from "./components/NavBar";

function App() {

  return (
    <>
      {/* <NavBar />*/}
      <main className="content">
        <Routes>
          <Route path="/" element={<DisasterDimensions/>} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/more-info" element={<MoreInfo />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
