import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';
import Fallback from '../assets/Fallback.png';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const Heading = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  margin-top: 0px;
  font-size: 2rem;
  color: #333;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  max-height: 100%;
  background-color: #ecd400;
  overflow-y: auto;
  height: calc(100vh - 256px);
  flex-direction: row;
  justify-content: center;
  border: 2px solid orange;
`;

const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
  width: 400px;
  min-width: 200px;
  text-align: center;
  max-height: 350px;
  border-bottom: 2px solid black;
  border-left: 2px solid black;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 150px;
  object-fit: contain;
  border-radius: 5px;
  background-color: black;
`;

const Info = styled.div`
  margin-top: 10px;
`;

const CancelButton = styled.button`
  background-color: red;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: darkred;
  }
`;

const Label = styled.span`
  font-weight: bold;
`;

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [spaces, setSpaces] = useState({});
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const token = Cookies.get('token');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${url}bookings/getUserAll?token=${token}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setBookings(data);

          // Fetch space details for each booking
          const spacePromises = data.map((booking) =>
            fetch(`${url}spaces/get/${booking.SpaceID}?token=${token}`).then(
              (res) => res.json())
          );

          const spacesData = await Promise.all(spacePromises);

          // Map space details with booking info
          const spacesMap = spacesData.reduce((acc, space) => {
            if (space && space.SpaceID) {
              acc[space.SpaceID] = space;
            }
            return acc;
          }, {});

          setSpaces(spacesMap);
        } else {
          console.error('Unexpected response format:', data);
          alert('Unexpected response format while fetching bookings.');
          setBookings([]); // Set as empty array if response is not an array
        }

      } catch (error) {
        console.error('Error fetching bookings or spaces:', error);
        alert('There was an error fetching your bookings or space details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const handleCancelBooking = async (bookingID) => {
    try {
      await fetch(
        `${url}bookings/delete?BookingID=${bookingID}&token=${token}`, {
          method: 'DELETE',
        });

      const response = await fetch(`${url}bookings/getUserAll?token=${token}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error('Unexpected response format after cancel:', data);
        setBookings([]);
      }
      setBookings(data);
      setSnackbarMessage('Booking Cancelled successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('There was an error in cancelling booking!', error);
      setSnackbarMessage('There was an error in cancelling booking!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Heading>MANAGE BOOKINGS</Heading>
      <CardContainer>
        {Array.isArray(bookings) && bookings.length > 0 ?(
          bookings.map((booking) => {
            const space = spaces[booking.SpaceID];
            if (!space) {
              return null;
            }
            return (
              <Card key={booking.BookingID}>
                <Thumbnail src={space.Thumbnail || Fallback} alt={space.name} />
                <Info>
                  <h3>{space.Name}</h3>
                  <p><Label>Start Time: </Label>
                    {new Date(booking.StartTime).toLocaleString()}</p>
                  <p><Label>End Time: </Label>
                    {new Date(booking.EndTime).toLocaleString()}</p>
                  <CancelButton onClick={
                    () => handleCancelBooking(booking.BookingID)}>
                  Cancel
                  </CancelButton>
                </Info>
              </Card>
            );
          })) : (
          <p>No bookings found.</p>
        )}
      </CardContainer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManageBookings;
