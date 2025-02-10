import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
  maxWidth: '400px',
  padding: '20px',
  backgroundColor: 'black',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

const StyledTextField = styled(TextField)({
  margin: '10px 0',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '5px',
});

const StyledButton = styled(Button)({
  margin: '20px 0',
  width: '100%',
  backgroundColor: '#feda00',
  color: 'black',
  '&:hover': {
    backgroundColor: 'lightyellow',
  },
});

function LogIn(props) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogIn = async () => {
    try {
      // Perform login
      const loginResponse = await fetch(
        `${url}user/login?username=${encodeURIComponent(email)}` +
        `&password=${encodeURIComponent(password)}`,
        { method: 'GET' }
      );

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const token = await loginResponse.text();

      if (token) {
        // Fetch user details
        const userResponse = await fetch(
          `${url}user/get?email=${encodeURIComponent(email)}&` +
          `token=${encodeURIComponent(token)}`,
          { method: 'GET' }
        );

        if (!userResponse.ok) {
          throw new Error('Error fetching user details');
        }

        const userData = await userResponse.json();

        // Store token and user role in cookies
        Cookies.set('token', token, {
          expires: 1,
          // domain: '.openspaces.penguinserver.net',
          // httpOnly: true,
          // secure: true,
          // sameSite: 'Strict',
        });

        Cookies.set('role', userData.role, {
          expires: 1,
        });

        // Navigate to dashboard
        nav('/dashboard');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('There was an error logging in!', error);
      alert(error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledContainer>
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
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            variant="outlined"
          />
          <StyledButton variant="contained" color="primary"
            type="button" onClick={handleLogIn}>
            Log In
          </StyledButton>
        </StyledBox>
      </StyledContainer>
    </ThemeProvider>
  );
}

export default LogIn;
