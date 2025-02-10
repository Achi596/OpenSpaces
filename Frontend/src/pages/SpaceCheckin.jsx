import React, { useState } from 'react';
import { Container, Box, Button, TextField,
  Snackbar, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styled from '@emotion/styled';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import image5 from '../assets/checkin.png';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

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

const StyledRowContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: '20px',
  paddingBottom: '20px',
  height: 'calc(100vh - 128px)',
  background: 'linear-gradient(to bottom, #ffffff, #ffffff)',
  '@media (min-width: 1200px)': {
    maxWidth: 'none',
  },
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    width: '100%',
    padding: '10px',
    fontSize: '14px',
  },
});

const StyledSideBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '50%',
  height: '95%',
  maxWidth: '800px',
  minHeight: '300px',
  padding: '20px',
  backgroundColor: 'black',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  margin: '1px',
  color: 'white',
  '@media (max-width: 600px)': {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
  },
});

const StyledTextField = styled(TextField)({
  margin: '10px 0',
  width: '80%',
  backgroundColor: 'white',
  borderRadius: '5px',
  '& textarea': {
    minHeight: '100px',
  }
});

const StyledButton = styled(Button)({
  margin: '20px 20px',
  width: '40%',
  minWidth: '100px',
  padding: '10px 10px',
  backgroundColor: '#feda00',
  color: 'black',
  '&:hover': {
    backgroundColor: 'lightyellow',
  },
});

const DefaultLanding = styled.div`
  background-image: url(${image5});
  background-size: contain;
  background-position: center top;
  background-repeat: no-repeat;
  width: 100%;
  height: 80%;
  position: relative; // Changed to relative positioning
`;

function SpaceCheckin(props) {
  const [email, setEmail] = useState('');
  const [bookingpin, setBookingpin] = useState('');
  const [roomnumber, setRoomnumber] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const submit_checkin = async () => {
    try {
      const response = await fetch(`${url}space/checkIn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'username': email,
          'pin': bookingpin,
          'roomNumber': roomnumber
        }),

      });
      console.error(response.status);
      if (response.status === 200) {
        setSnackbarMessage('Check-In Successful');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } else {
        const data = await response.json();
        if (data.error) {
          alert(data.error);
          setSnackbarMessage(data.error);
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        } else {
          setSnackbarMessage('There was an error while checking in');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        }
      }
    } catch (error) {
      console.error('There was an error in checkin!', error);
      setSnackbarMessage('There was an error while checking in');
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
  return (
    <ThemeProvider theme={theme}>
      <StyledRowContainer>
        <StyledSideBox>
          <h2>Check-In to Space</h2>
          <StyledTextField
            label="Enter Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            variant="outlined"
          />
          <StyledTextField
            label="Enter Booking Pin"
            type="number"
            value={bookingpin}
            onChange={e => setBookingpin(e.target.value)}
            variant="outlined"
          />
          <StyledTextField
            label="Enter Room Number"
            value={roomnumber}
            onChange={e => setRoomnumber(e.target.value)}
            variant="outlined"
          />
          <StyledButton variant="contained" color="primary"
            type="button" endIcon={<MoreTimeIcon fontSize="large"/>}
            onClick={submit_checkin}>
                Check In
          </StyledButton>
        </StyledSideBox>
        <Box
          sx={{
            width: '70%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
          }}
        >
          <DefaultLanding />
        </Box>
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
      </StyledRowContainer>
    </ThemeProvider>
  );
}

export default SpaceCheckin;
