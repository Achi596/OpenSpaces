import React, { useState } from 'react';
import { Container,
  TextField, Button, Box, Snackbar, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';

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

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '20px',
  paddingBottom: '20px',
  height: '100%',
  background: 'linear-gradient(to bottom, #e8e8e8, #ffffff)',
  '@media (min-width: 1200px)': {
    maxWidth: 'none',
  },
});

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  maxWidth: '800px',
  minheight: '300px',
  padding: '20px 20px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: '10px',
  color: 'black',
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
  width: '20%',
  padding: '6px 16px',
  backgroundColor: '#feda00',
  color: 'black',
  '&:hover': {
    backgroundColor: 'lightyellow',
  },
});

function UserHelp(props) {

  const [texthelp, setTexthelp] = useState('');
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const token = Cookies.get('token');
  const submit_help = async () => {
    try {
      const response = await fetch(`${url}help/create?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': token,
          'textHelp': texthelp,
          'userEmail': email
        }),

      });

      if (response.status === 200) {
        setSnackbarMessage('Feedback submitted successfully');
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
          setSnackbarMessage('There was an error in feedback!');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        }
      }
    } catch (error) {
      console.error('There was an error in feedback!', error);
      setSnackbarMessage('There was an error in feedback!');
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
      <StyledContainer>
        <h2>Technical Support</h2>
        <StyledBox>
          <StyledTextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            variant="outlined"
          />
          <StyledTextField
            label="Enter Help Request"
            value={texthelp}
            onChange={e => setTexthelp(e.target.value)}
            multiline
          />
          <StyledButton variant="contained" color="primary" type="button"
            endIcon={<SendIcon />} onClick={submit_help}>
                Submit
          </StyledButton>
        </StyledBox>
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
      </StyledContainer>
    </ThemeProvider>
  );
}

export default UserHelp;
