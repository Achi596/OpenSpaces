import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Box, Typography,
  Select,FormControl,InputLabel, MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

// STYLING
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

const StyledText = styled(Typography)({
  color: 'white',
  textAlign: 'center'
});

// COMPONENT
function SignUp() {
  const nav = useNavigate();
  const [role, setRole] = useState('');
  const [school, setSchool] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeExpired, setCodeExpired] = useState(false);

  useEffect(() => {
    let timer;
    if (verificationSent) {
      timer = setTimeout(() => {
        setCodeExpired(true);
      }, 600000); // 10 min
    }
    return () => clearTimeout(timer);
  }, [verificationSent]);

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleSchoolChange = (event) => {
    setSchool(event.target.value);
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert('Passwords Do Not Match');
      return;
    }

    try {
      const response = await fetch(`${url}user/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'role': role,
          'SchoolName': school,
        }),
      });

      if (response.status === 200) {
        sendVerificationCode(email);
      } else {
        const data = await response.json();
        if (data.error) {
          alert(data.error);
        } else {
          alert('There was an error during sign up!');
        }
      }
    } catch (error) {
      console.error('There was an error during sign up!', error);
      alert('There was an error during sign up!');
    }
  };

  const sendVerificationCode = async (email) => {
    try {
      const response = await fetch(`${url}user/sendCode?username=${email}`, {
        method: 'GET'
      });
      if (response.ok) {
        setVerificationSent(true);
        setCodeExpired(false);
      } else {
        console.error('There was an error sending the verification code!');
        alert('There was an error sending the verification code!');
      }
    } catch (error) {
      console.error('There was an error sending the verification code!', error);
      alert('There was an error sending the verification code!');
    }
  };

  const handleVerify = async () => {
    const username = email;
    const verificationCodeNumber = parseInt(verificationCode, 10);
    const bod = JSON.stringify({
      username,
      verificationCode: verificationCodeNumber
    });
    try {
      const response = await fetch(`${url}user/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bod,
      });
      if (response.status === 200) {
        alert('Verification successful!');
        autoLogin(email, password);
      } else {
        const data = await response.json();
        if (data.error) {
          alert(data.error);
        } else {
          alert('There was an error during verification!');
        }
      }
    } catch (error) {
      console.error('There was an error during sign up!', error);
      alert('There was an error during verification!');
    }
  };

  const autoLogin = async (email, password) => {
    setVerificationSent(false);
    setCodeExpired(false);
    try {
      const loginResponse = await fetch(
        `${url}user/login?username=${encodeURIComponent(email)}&` +
        `password=${encodeURIComponent(password)}`,
        { method: 'GET' }
      );

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const token = await loginResponse.text();

      if (token) {
        // Store token in cookies
        Cookies.set('token', token, { expires: 1 });

        const userResponse = await fetch(
          `${url}user/get?email=${encodeURIComponent(email)}` +
          `&token=${encodeURIComponent(token)}`,
          { method: 'GET' }
        );

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }

        const userData = await userResponse.json();

        // Store user role in cookies
        Cookies.set('role', userData.role, { expires: 1 });

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
        {!verificationSent ? (
          <StyledBox>
            <StyledTextField
              label="First Name"
              name="firstName"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              variant="outlined"
            />
            <StyledTextField
              label="Last Name"
              name="lastName"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              variant="outlined"
            />
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
            <StyledTextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              variant="outlined"
            />
            <Box sx={{ minWidth: 120, width: '100%', margin: '10px 0' }}>
              <FormControl fullWidth>
                <InputLabel id="type-select-label">Role</InputLabel>
                <Select
                  labelId="type-select-label"
                  id="type-select"
                  value={role}
                  onChange={handleRoleChange}
                  label="Role"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '5px'
                  }}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="HDR">HDR</MenuItem>
                  <MenuItem value="Student">Student</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120, width: '100%', margin: '10px 0' }}>
              <FormControl fullWidth>
                <InputLabel id="type-select-label">School</InputLabel>
                <Select
                  labelId="type-select-label"
                  id="type-select"
                  value={school}
                  onChange={handleSchoolChange}
                  label="School"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '5px'
                  }}
                >
                  <MenuItem value="School of Computer Sci & Eng">
                  School of Computer Sci & Eng</MenuItem>
                  <MenuItem value="School of Mech Eng">
                  School of Mech Eng</MenuItem>
                  <MenuItem value="School of Civil Eng">
                  School of Civil Eng</MenuItem>
                  <MenuItem value="School of Elec Eng">
                  School of Elec Eng</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <StyledButton variant="contained" color="primary"
              type="button" onClick={handleSignUp}>
              Sign Up
            </StyledButton>
          </StyledBox>
        ) : (
          <StyledBox>
            {codeExpired ? (
              <>
                <StyledText variant="body1">
                  The previous verification code has expired.
                </StyledText>
                <StyledButton
                  variant="contained"
                  color="primary"
                  type="button"
                  onClick={() => sendVerificationCode(email)}
                >
                  Resend Code
                </StyledButton>
              </>
            ) : (
              <>
                <StyledText variant="body1">
                  A verification code has been sent to your email.
                </StyledText>
                <StyledText variant="body1">
                  Please enter the verification code below.
                  The code is valid for 10 minutes.
                </StyledText>
                <StyledTextField
                  label="Verification Code"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  variant="outlined"
                />
                <StyledButton
                  variant="contained"
                  color="primary"
                  type="button"
                  onClick={handleVerify}
                >
                  Verify
                </StyledButton>
              </>
            )}
          </StyledBox>
        )}
      </StyledContainer>
    </ThemeProvider>
  );
}

export default SignUp;
