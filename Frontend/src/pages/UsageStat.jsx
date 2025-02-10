import React, { useState } from 'react';
import { Container, Box, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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

const StyledrowContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'row',
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

const StyledsideBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '30%',
  height: '95%',
  maxWidth: '800px',
  minheight: '300px',
  padding: '20px 20px',
  backgroundColor: 'grey',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  margin: '1px 1px',
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

function UsageStat(props) {
  const token = Cookies.get('token');
  const [space, setSpace] = useState();
  const [stats, setStats] = useState([]);
  const showStats = async () => {
    try {
      const response =
      await fetch(`${url}usageStats/get?spaceId=${space}&token=${token}`, {
        method: 'GET',
      });
      const data = await response.json();
      if (response.status === 200) {
        setStats(data);
      } else {
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          alert('Failed to fetch stats. Please try again.');
        }
      }
    } catch (error) {
      console.error('There was an error in fetching stats!', error);
      alert('An error occurred while fetching stats!');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledrowContainer>
        <StyledsideBox>
          <h2>Usage Statistics</h2>
          <StyledTextField
            label="Space Id"
            type="number"
            variant="outlined"
            value={space}
            onChange={e => setSpace(e.target.value)}
          />
          <StyledButton variant="contained" color="primary" type="button"
            onClick={showStats}>
                Show
          </StyledButton>
        </StyledsideBox>
        <StyledrowContainer>
          <StyledBox>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Space ID: </strong>{space}</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(stats).length > 0 ? (
                    <>
                      <TableRow>
                        <TableCell>Total Bookings</TableCell>
                        <TableCell>{stats['totalBookings']}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Checked-In Bookings</TableCell>
                        <TableCell>{stats['checkedInBookings']}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Not Checked-In Bookings</TableCell>
                        <TableCell>{stats['notCheckedInBookings']}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Bookings Last Week</TableCell>
                        <TableCell>{stats['totalBookingsLastWeek']}</TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}
                        align="center">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledBox>
        </StyledrowContainer>
      </StyledrowContainer>
    </ThemeProvider>
  );
}

export default UsageStat;
