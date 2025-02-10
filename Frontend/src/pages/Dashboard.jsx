import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';
import LargeButton from '../components/LargeButton';
import image1 from '../assets/K17Image1.jpg';
import image2 from '../assets/K17Image2.jpg';
import image3 from '../assets/K17Image3.jpg';
import image4 from '../assets/K17Image4.jpg';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 128px);
  background-color: white;
`;

const ButtonWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Dashboard = () => {
  const nav = useNavigate();
  const token = Cookies.get('token');
  const userRole = Cookies.get('role');
  const isLoggedIn = Boolean(token);
  // Check if user is an admin
  const isAdmin = userRole === 'Admin';

  const handleNewBookingClick = () => {
    nav('/selectfloor');
  };

  const handleSpaceCheckinClick = () => {
    nav('/spacecheckin');
  };

  const handleEditSpacesClick = () => {
    nav('/editfloor');
  };

  const handleManageBookingsClick = () => {
    nav('/bookings/manage');
  };

  if (!isLoggedIn) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <Container>
      <ButtonWrapper>
        <LargeButton
          text="New Booking"
          color="rgba(0, 0, 0, 0.5)" // Black filter with transparency
          image={image3}
          textColor="white"
          onClick={handleNewBookingClick}
        />
        <LargeButton
          text="Space Check-In"
          color="rgba(255, 255, 0, 0.5)" // Yellow filter with transparency
          image={image2}
          textColor="black"
          onClick={handleSpaceCheckinClick}
        />
        <LargeButton
          text="Manage Bookings"
          color="rgba(0, 0, 0, 0.5)" // Black filter with transparency
          image={image4}
          textColor="white"
          onClick={handleManageBookingsClick}
        />
        {isAdmin && (
          <LargeButton
            text="Edit and Add Spaces"
            color="rgba(255, 255, 0, 0.5)" // Yellow filter with transparency
            image={image1}
            textColor="white"
            onClick={handleEditSpacesClick}
          />
        )}
      </ButtonWrapper>
    </Container>
  );
};

export default Dashboard;
