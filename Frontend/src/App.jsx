import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Banner from './components/Banner';
import Nav from './components/Nav';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import UserFeedback from './pages/UserFeedback';
import UserHelp from './pages/UserHelp';
import FloorSelect from './pages/FloorSelect';
import BookSpace from './pages/BookSpace';
import UsageStat from './pages/UsageStat';
import SpaceCheckin from './pages/SpaceCheckin';
import Notifications from './pages/Notifications';
import Sidebar from './components/Sidebar';
import styled from '@emotion/styled';
import SearchSpace from './pages/SearchSpace';
import FloorEdit from './pages/FloorEdit';
import ManageBookings from './pages/ManageBookings';

const AppContainer = styled.div`
  display: flex;
  height: calc(100vh - 128px); ;
  width: 100vw;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
`;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Banner />
      <Nav onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
      <AppContainer>
        <Sidebar isOpen={sidebarOpen} onMobileClick={toggleSidebar} />
        <MainContent sidebarOpen={sidebarOpen}>
          <Routes>
            <Route path="/" element={<Landing/>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<LogIn/>} />
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/userfeedback" element={<UserFeedback/>} />
            <Route path="/userhelp" element={<UserHelp/>} />
            <Route path="/selectfloor" element={<FloorSelect/>} />
            <Route path="/book" element={<BookSpace/>} />
            <Route path="/search" element={<SearchSpace/>} />
            <Route path="/usagestat" element={<UsageStat/>} />
            <Route path="/spacecheckin" element={<SpaceCheckin/>} />
            <Route path="/notifications" element={<Notifications/>} />
            <Route path="/editfloor" element={<FloorEdit/>} />
            <Route path="/bookings/manage" element={<ManageBookings/>} />
          </Routes>
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;
