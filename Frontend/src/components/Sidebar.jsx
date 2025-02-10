import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, List,
  ListItemText, Divider, Collapse, ListItemButton } from '@mui/material';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';
import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const SidebarContainer = styled(Box)`
  width: ${props => (props.isOpen ? '30%' : '0')};
  min-width: ${props => (props.isOpen ? '250px' : '0')};
  max-width: 250px;
  overflow-x: hidden;
  background-color: lightgrey;
  color: black;
  height: calc(100vh - 128px);
  margin-right: 0px;

  @media (max-width: 820px) {
    max-width: 100% !important;
    width: ${props => (props.isOpen ? '100%' : '0')};
    position: fixed;
    left: 0;
    z-index: 1200;
    height: calc(100vh - 128px);
    margin-top: 0px;
  }
`;

const StyledListItem = styled(ListItemButton)`
  color: blue;
  text-decoration: underline;
  &:hover {
    text-decoration: none;
  }
`;

const StyledCollapsibleListItem = styled(ListItemButton)`
  color: black;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledIcon = styled.div`
  color: grey;
  margin-right: 8px;
`;

const StyledExpandIcon = styled.div`
  margin-left: auto;
  color: white; // Set arrow icon color to white
`;

function Sidebar({ isOpen, onMobileClick }) {
  const nav = useNavigate();
  const [openBookingHistory, setOpenBookingHistory] = useState(false);
  const [latestBookings, setLatestBookings] = useState([]);
  const token = Cookies.get('token');
  const userRole = Cookies.get('role');
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${url}bookings/getUserAll?token=${token}`);
        const data = await response.json();

        const uniqueSpaceMap = new Map();

        // Populate the Map with unique SpaceIDs
        data.forEach(booking => {
          if (!uniqueSpaceMap.has(booking.SpaceID)) {
            uniqueSpaceMap.set(booking.SpaceID, booking);
          }
        });
        // Convert Map values to an array and reverse it
        const uniqueBookings = Array.from(uniqueSpaceMap.values()).reverse();

        // Get the latest 5 unique spaces
        const latestBookings = uniqueBookings.slice(0, 5);

        // Fetch space details for each booking
        const spacePromises = latestBookings.map((booking) =>
          fetch(`${url}spaces/get/${booking.SpaceID}?token=${token}`)
            .then((res) => res.json())
        );

        const spacesData = await Promise.all(spacePromises);

        // Combine booking info with space details
        const bookingsWithSpaces = latestBookings.map((booking, index) => ({
          ...booking,
          SpaceName: spacesData[index].Name,
        }));

        setLatestBookings(bookingsWithSpaces);
      } catch (error) {
        alert('No Recent Bookings');
        console.error('Error fetching bookings or spaces:', error);
      }
    };

    if (openBookingHistory) {
      fetchBookings();
    }
  }, [openBookingHistory, token]);

  const handleBookingHistoryClick = () => {
    setOpenBookingHistory(!openBookingHistory);
  };

  const handleNavClick = (path) => {
    if (window.innerWidth < 769 && isOpen) {
      onMobileClick(); // Toggle the sidebar
    }
    nav(path);
  };

  const goBook = (spaceID) => {
    if (window.innerWidth < 769 && isOpen) {
      onMobileClick();
    }
    nav(`/book?space=${spaceID}`);
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <List component="nav">
        {token && (
          <>
            <StyledCollapsibleListItem onClick={handleBookingHistoryClick}>
              <StyledIcon><HistoryIcon /></StyledIcon>
              <ListItemText primary="Recently Booked" />
              <StyledExpandIcon>
                {openBookingHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </StyledExpandIcon>
            </StyledCollapsibleListItem>
            <Collapse in={openBookingHistory} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {latestBookings.map((booking) => (
                  <StyledListItem
                    key={booking.BookingID}
                    onClick={() => goBook(booking.SpaceID)}>
                    <ListItemText primary={booking.SpaceName} />
                  </StyledListItem>
                ))}
              </List>
            </Collapse>
            <Divider style={{ backgroundColor: 'white', height: '2px' }} />
            <StyledListItem onClick={() => handleNavClick('/userfeedback')}>
              <StyledIcon><FeedbackIcon /></StyledIcon>
              <ListItemText primary="Feedback" />
            </StyledListItem>
            <Divider style={{ backgroundColor: 'white', height: '2px' }} />
            <StyledListItem onClick={() => handleNavClick('/userhelp')}>
              <StyledIcon><HelpIcon /></StyledIcon>
              <ListItemText primary="Help" />
            </StyledListItem>
            {isAdmin && (
              <StyledListItem onClick={() => handleNavClick('/usagestat')}>
                <StyledIcon><AnalyticsIcon /></StyledIcon>
                <ListItemText primary="Usage Statistics" />
              </StyledListItem>
            )}
          </>
        )}
        <StyledListItem onClick={() => handleNavClick('/spacecheckin')}>
          <StyledIcon><MoreTimeIcon /></StyledIcon>
          <ListItemText primary="Check In" />
        </StyledListItem>
        {token && (
          <>
            <Divider style={{ backgroundColor: 'white', height: '2px' }} />
            <StyledListItem onClick={() => handleNavClick('/dashboard')}>
              <StyledIcon><DashboardIcon /></StyledIcon>
              <ListItemText primary="Dashboard" />
            </StyledListItem>
          </>
        )}
      </List>
    </SidebarContainer>
  );
}

export default Sidebar;
