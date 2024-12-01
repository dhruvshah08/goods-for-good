import React from 'react';
import logo from './logo.svg';
import './App.css';
import DonationDetailsPage from './components/DonationDetailsPage';
import DonatePage from './components/DonatePage';
import HomePage from './components/HomePage';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: "Georgia",
  },
});
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePageWrapper />} />
          <Route path="/donationdetails" element={<DonationDetailsWrapper/>} />
          <Route path="/confirmdonation" element={<DonationPageWrapper />} />
        </Routes>
     </Router>
    </div>
  );
}
const HomePageWrapper = () => {
  const location = useLocation();
  const email = location.state?.email;
  return <HomePage email={email} />;
};

const DonationDetailsWrapper = () => {
  const location = useLocation();
  const email = location.state?.email;
  const campaign = location.state?.campaign;
  return <DonationDetailsPage email = {email} campaign={campaign} />;
};

const DonationPageWrapper = () => {
  const location = useLocation();
  const email = location.state?.email;
  const campaign = location.state?.campaign;
  return <DonatePage email = {email} campaign={campaign} />;
};

export default App;
