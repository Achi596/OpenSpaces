import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';
import Fallback from '../assets/Fallback.png';

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
  border: 0.3vh solid black;
  border-radius: 1%;
  padding: 1%;
  box-shadow: 0 1.2vh 2.4vh rgba(0, 0, 0, 0.1);
  background-color: white;
  width: 22vw;
  text-align: center;
  height: 36vh;
`;

const Thumbnail = styled.img`
  margin: 0;
  padding: 0;
  width: 10vw;
  height: 20vh;
  object-fit: contain;
  border: 0.5vh solid black;
`;

const Info = styled.div`
  margin-top: 10px;
`;

const CancelButton = styled.button`
  background-color: #EDD401;
  color: black;
  fontSize: '20%',
  border: none;
  border-radius: 4%;
  padding: 3%;
  width: 35%;
  cursor: pointer;

  &:hover {
    background-color: grey;
  }
`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchSpace(props) {
  const query = useQuery();
  const nav = useNavigate();
  const keywords = query.get('query');
  const token = Cookies.get('token');
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        if (keywords) {
          const response = await
          fetch(`${url}spaces/search?token=${token}&keywords=${keywords}`);
          const data = await response.json();
          if (Array.isArray(data)) {
            setSpaces(data);
          } else {
            console.error('Unexpected response format:', data);
            alert('Unexpected format received');
            setSpaces([]); // Set as empty array if response is not an array
          }
        }
      } catch (error) {
        alert('An error occurred while fetching spaces.');
        console.error('Error fetching bookings or spaces:', error);
        setSpaces([]);
      }
    };

    fetchSpaces();
  }, [token, keywords]);

  return (
    <ThemeProvider theme={theme}>
      <CardContainer>
        {spaces.length > 0 ? (
          spaces.map((space) => (
            <Card key={space.SpaceID}>
              <Thumbnail src={space.Thumbnail || Fallback} // eslint-disable-line max-len
                alt={space.name} />
              <Info>
                <h3>{space.Name}</h3>
                <p><b>Type:</b> {space.Type}</p>
                <CancelButton onClick={() =>
                  nav('/book?space='+ space.SpaceID)}>
                    Book
                </CancelButton>
              </Info>
            </Card>
          ))
        ) : (
          <p>No spaces found for the given search criteria.</p>
        )
        }
      </CardContainer>
    </ThemeProvider>
  );
}

export default SearchSpace;
