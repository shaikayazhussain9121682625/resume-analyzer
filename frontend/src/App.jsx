import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Upload from "./Upload";
import Result from "./Result";
import MatchResume from "./MatchResume";
import MatcherResult from "./MatcherResult";
import ResumeBuilder from "./ResumeBuilder";
import Profile from "./Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/upload" element={<Upload />} />
        <Route path="/upload_resume" element={<Upload />} />

        <Route path="/result" element={<Result />} />

        <Route path="/matchresume" element={<MatchResume />} />
        <Route path="/matcher-result" element={<MatcherResult />} />

        <Route path="/resumebuilder" element={<ResumeBuilder />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
