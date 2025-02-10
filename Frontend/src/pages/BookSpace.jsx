import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import ErrorPopup from '../components/ErrorPopup';
import Fallback from '../assets/Fallback.png';

import styled from '@emotion/styled';
import { Container, Box, Button, TextField,
  Snackbar, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#feda00',
          },
        },
        notchedOutline: {
          borderColor: '#feda00',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#feda00',
          },
        },
      },
    },
  },
});

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '10px',
  marginTop: '0px',
  alignItems: 'center',
  height: '99%',
  background: 'linear-gradient(to bottom, #e8e8e8, #ffffff)',
  '@media (min-width: 1200px)': {
    maxWidth: 'none',
  },
});

const StyledrowContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: '20px',
  paddingBottom: '20px',
  height: '100%',
  marginRight: 'none',
  background: 'linear-gradient(to bottom, #e8e8e8, #ffffff)',
  '@media (min-width: 1200px)': {
    maxWidth: 'none',
  },
  '@media (max-width: 700px)': {
    maxWidth: '80vw',
  },
});

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '40vh',
  maxWidth: '800px',
  minWidth: '50px',
  minheight: '300px',
  padding: '20px 20px',
  backgroundColor: 'black',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: '10px',
  color: 'white',
});

const StyledspaceBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '90%',
  height: '30%',
  maxWidth: '800px',
  minheight: '300px',
  padding: '5% 20px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: '10px',
  color: 'black',
  textAlign: 'left',
  '@media (max-height: 800px)': {
    padding: '2% 20px',
    overflowY: 'scroll',
  },
});

const StyledsideBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '30%',
  height: '95%',
  maxWidth: '800px',
  marginTop: '80px',
  padding: '20px 20px',
  backgroundColor: 'black',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  margin: '1px',
  color: 'white',
  textAlign: 'left',
  '@media (max-height: 700px)': {
    minHeight: '90vh',
    marginTop: '190px',
  },
});

const StyledTextField = styled(TextField)({
  margin: '2% 0',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '5px',
  '& input': {
    height: '1.5rem',
  },
  '& textarea': {
    minHeight: '2rem',
  },
  '& .MuiInputBase-input': {
    padding: '3%',
  }
});

const StyledButton = styled(Button)({
  margin: '5%',
  width: '100%',
  backgroundColor: '#feda00',
  color: 'black',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: 'lightyellow',
  },
});

const LeftAlignedHeading = styled.h2({
  textAlign: 'left',
  width: '100%',
  fontSize: '150%',
});

const FieldHeadings = styled('span')({
  display: 'block',
  textAlign: 'left',
  marginBottom: 0,
  fontSize: '100%',
});

const DetailsHeading = styled.h2({
  fontSize: '130%',
  margin: '2%',
  fontWeight: 'normal',
});

const DetailsText = styled.h2({
  fontSize: '105%',
  margin: '2%',
  fontWeight: 'normal',
});

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function formatBookingTimes(bookingDate, startTime, endTime) {

  // Parse the booking date and times
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  // Create Date objects using the booking date and start/end times
  const startDateTime = new Date(bookingDate);
  startDateTime.setHours(startHours, startMinutes, 0);

  const endDateTime = new Date(bookingDate);
  endDateTime.setHours(endHours, endMinutes, 0);

  // Manually format to ISO 8601 without converting to UTC
  const pad = (num) => String(num).padStart(2, '0');

  const formattedStartTime = `${startDateTime.getFullYear()}-${
    pad(startDateTime.getMonth() + 1)}-${
    pad(startDateTime.getDate())}T${
    pad(startDateTime.getHours())}:${
    pad(startDateTime.getMinutes())}:${
    pad(startDateTime.getSeconds())}`;

  const formattedEndTime = `${endDateTime.getFullYear()}-${
    pad(endDateTime.getMonth() + 1)}-${
    pad(endDateTime.getDate())}T${
    pad(endDateTime.getHours())}:${
    pad(endDateTime.getMinutes())}:${
    pad(endDateTime.getSeconds())}`;

  return {
    startTime: formattedStartTime,
    endTime: formattedEndTime
  };
}
const ScrollableBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minWidth: '50px',
  height: '100%',
  overflowY: 'scroll',
  padding: '10px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

const BookingCard = styled(Card)({
  marginBottom: '10px',
  padding: '10px',
  textAlign: 'center',
  minHeight: '150px'
});

const Label = styled(Typography)({
  fontWeight: 'bold', // Make label text bold
});

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

function BookSpace(props) {
  const query = useQuery();
  const spaceID = query.get('space');
  const url = process.env.BACKEND_URL ||
   'https://backend.openspaces.penguinserver.net/';
  const token = Cookies.get('token');

  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [Capacity, setCapacity] = useState('');
  const [Projectors, setProjectors] = useState('');
  const [Whiteboards, setWhiteboards] = useState('');
  const [Desktops, setDesktops] = useState('');
  const [Thumbnail, setThumbnail] = React.useState(null);
  const [BookingDate, setBookingDate] = useState('');
  const [StartTime, setStartTime] = useState('');
  const [EndTime, setEndTime] = useState('');
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [showError, setShowError] = React.useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [bookings, setBookings] = useState([]);

  const todayDate = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const maxDate = futureDate.toISOString().split('T')[0];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${url}bookings/list/${spaceID}?token=${token}`
        );
        const data = await response.json();
        // Ensure StartTime is a valid date
        const sortedData = data.sort((a, b) => {
          const startA = new Date(a.StartTime);
          const startB = new Date(b.StartTime);
          return startA - startB;
        });

        setBookings(sortedData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        alert('Error fetching bookings!');
      }
    };
    fetchBookings();
  }, [spaceID, url, token]);

  const handleTimeChange = (event) => {
    const { name, value } = event.target;
    const [hours, minutes] = value.split(':').map(Number);
    const selectedDate = new Date();
    selectedDate.setHours(hours, minutes);

    // Define the allowed time range
    const startTime = new Date();
    startTime.setHours(8, 0); // 8 AM

    const endTime = new Date();
    endTime.setHours(20, 0); // 8 PM

    if (selectedDate < startTime || selectedDate > endTime) {
      // Reset the value if outside allowed range
      event.target.value = '';
      setErrorMessage('Please select a time between 8 AM and 8 PM.');
      setShowError(true);
      return;
    }

    // Update state based on field name
    if (name === 'startTime') {
      setStartTime(value);
    } else if (name === 'endTime') {
      setEndTime(value);
    }
  };

  const closeErrorPopup = () => {
    setShowError(false);
    setErrorMessage(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const submit_booking = async () => {
    try {
      if (!BookingDate || !StartTime || !EndTime) {
        setErrorMessage('Please fill in all booking details.');
        setShowError(true);
        return;
      }

      if (new Date(`${BookingDate}T${StartTime}`)
        >= new Date(`${BookingDate}T${EndTime}`)) {
        setErrorMessage('End time must be after start time.');
        setShowError(true);
        return;
      }

      const formattedData = formatBookingTimes(BookingDate, StartTime, EndTime);

      const response = await fetch(
        `${url}booking/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'token': token,
            'spaceId': spaceID,
            'startTime': formattedData.startTime,
            'endTime': formattedData.endTime,
            'notes': 'remove?',
          }),
        });

      if (response.ok) {
        setSnackbarMessage('Space booked successfully');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData || 'An unknown error occurred';
        setErrorMessage(`${response.status}: ${errorMessage}`);
        setShowError(true);
      }
    } catch {
      setErrorMessage('There was an error booking the space!');
      setShowError(true);
    }
  };

  fetch(`${url}spaces/get/${spaceID}?token=${token}`)
    .then(response => response.json())
    .then(body => {
      setType(body.Type);
      setName(body.Name);
      setCapacity(body.Capacity);
      setProjectors(body.Projector);
      setWhiteboards(body.Whiteboard);
      setDesktops(body.Desktops);
      setThumbnail(body.Thumbnail || Fallback);
    })
    .catch(error => {
      console.error('Error fetching space details:', error);
      setErrorMessage('Error fetching space details:', error);
      setShowError(true);
    });

  return (
    <ThemeProvider theme={theme}>
      <StyledrowContainer>
        <StyledsideBox>
          <LeftAlignedHeading>{name}</LeftAlignedHeading>
          <StyledspaceBox>
            <DetailsHeading>Details</DetailsHeading>
            <DetailsText><b>Space Type: </b>{type}</DetailsText>
            <DetailsText><b>Capacity: </b>{Capacity}</DetailsText>
            <DetailsText><b>Projectors: </b>{Projectors}</DetailsText>
            <DetailsText><b>Whiteboards: </b>{Whiteboards}</DetailsText>
            <DetailsText><b>Desktops: </b>{Desktops}</DetailsText>
          </StyledspaceBox>
          <LeftAlignedHeading>Booking Info</LeftAlignedHeading>
          <FieldHeadings>Date:</FieldHeadings>
          <StyledTextField
            name="date"
            id="date-field"
            type="date"
            variant="filled"
            inputProps={{
              min: todayDate, // Disables past dates
              max: maxDate,   // Disables dates more than 7 days in the future
            }}
            value={BookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
          <span>Start Time:</span>
          <StyledTextField
            name="startTime"
            id="start-field"
            type="time"
            variant="filled"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            onChange={handleTimeChange}
          />
          <span>End Time:</span>
          <StyledTextField
            name="endTime"
            id="end-field"
            type="time"
            variant="filled"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            onChange={handleTimeChange}
          />
          <StyledButton onClick={submit_booking}> Book</StyledButton>
        </StyledsideBox>
        <StyledContainer>
          <StyledBox>
            <Card>
              <CardMedia
                component="img"
                alt="Thumbnail"
                style={{
                  maxWidth: '42vw',
                  maxHeight: '34vh',
                  objectFit: 'contain',
                }}
                image={Thumbnail}
              />
            </Card>
          </StyledBox>
          <StyledBox>
            <h2 style={
              {
                fontSize: '130%',
                margin: '2%',
                fontWeight: 'bold' }}>
              Booking Schedule
            </h2>
            <ScrollableBox>
              {bookings.map((booking) => (
                <BookingCard key={booking.id}>
                  <CardContent>
                    <Label>Start Time:</Label>
                    <Typography>{formatDateTime(booking.StartTime)}</Typography>
                    <Label>End Time:</Label>
                    <Typography>{formatDateTime(booking.EndTime)}</Typography>
                  </CardContent>
                </BookingCard>
              ))}
            </ScrollableBox>

          </StyledBox>
        </StyledContainer>
      </StyledrowContainer>

      {showError && (
        <ErrorPopup
          errorMessage={errorMessage}
          showError={showError}
          closeErrorPopup={closeErrorPopup}
        />
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default BookSpace;
