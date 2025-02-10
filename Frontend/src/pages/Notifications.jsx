import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';
import {Box, Container, Button} from '@mui/material';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 128px)',
  alignItems: 'center',
  paddingTop: '20px',
  background: '#ecd400',
  '@media (min-width: 1200px)': {
    maxWidth: 'none',
  },
});

const NotificationsWrapper = styled(Box)({
  width: '100%',
  maxHeight: '60vh',
  overflowY: 'auto',
});

const NotifBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '95%',
  padding: '5px',
  margin: '10px 0',
  backgroundColor: 'grey',
  opacity: '0.7',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

const NotifContent = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '10px',
});

const StyledButton = styled(Button)({
  margin: '10px 10px',
  width: '8%',
  padding: '5px 5px',
  backgroundColor: '#feda00',
  color: 'black',
  '&:hover': {
    backgroundColor: 'lightyellow',
  },
});

function Notifications(props) {
  const [notifs, setNotifs] = useState([]);
  const token = Cookies.get('token');
  const fetchNotifications = useCallback(() => {
    fetch(`${url}notifications/get?token=${token}`)
      .then((response) => response.json())
      .then((data) => {
        setNotifs(data);
        console.error(data);
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
        alert('There was an error fetching notifications. Please try again.');
      });
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const deleteRequest = (id) => {
    const notifToClear = notifs.find((notif) => notif.NotificationID === id);
    if (notifToClear) {
      fetch(`${url}notifications/delete?notificationID=${id}&token=${token}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            fetchNotifications();
          } else {
            console.error('Failed to delete notification from the database');
            alert('Failed to delete notification from the database.');
          }
        })
        .catch((error) => {
          console.error('Error deleting notification:', error);
          alert('There was an error deleting the notification.');
        });
    }
  };
  const handleAccept = async (id) => {
    try {
      const response = await fetch(`${url}booking/override?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'username': (notifs.find((notif) =>
            notif.NotificationID === id)['Username']),
          'spaceId': (notifs.find((notif) =>
            notif.NotificationID === id)['SpaceID']),
          'startTime': (notifs.find((notif) =>
            notif.NotificationID === id)['StartTime']),
          'endTime': (notifs.find((notif) =>
            notif.NotificationID === id)['EndTime']),
          'token': token,
        }),

      });
      if (response.status === 200) {
        alert('Success');
      } else {
        const data = await response.json();
        if (data.error) {
          alert(data.error);
        } else {
          alert('There was an error in feedback!');
        }
      }
    } catch (error) {
      console.error('There was an error in feedback!', error);
      alert('There was an error in feedback!');
    }
  };

  return (
    <StyledContainer>
      <h2>Notifications</h2>
      <NotificationsWrapper>
        {notifs.length === 0 ? (
          <NotifBox>
            <NotifContent>
              <p>No notifications to display</p>
            </NotifContent>
          </NotifBox>
        ) : (
          notifs.map((notif) => (
            <NotifBox key={notif.NotificationID}>
              {notif.Type === 'Override Request' && (
                <>
                  <NotifContent>
                    <p>
                      {notif.Message}
                      {notif.Username} at Space ID: {notif.SpaceID}  ;
                    From {new Date(notif.StartTime).toLocaleString()} to{' '}
                      {new Date(notif.EndTime).toLocaleString()}
                    </p>
                    <div>
                      <StyledButton
                        variant="contained"
                        color="primary"
                        onClick={() => handleAccept(notif.NotificationID)}
                      >
                      Accept
                      </StyledButton>
                      <StyledButton
                        variant="contained"
                        color="secondary"
                        onClick={() => deleteRequest(notif.NotificationID)}
                      >
                      Clear
                      </StyledButton>
                    </div>
                  </NotifContent>
                </>
              )}
              {notif.Type === 'Help Request' && (
                <NotifContent>
                  <p>
                    {notif.Message} {notif.Username}
                  </p>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    type="button"
                    onClick={() => deleteRequest(notif.NotificationID)}
                  >
                  Clear
                  </StyledButton>
                </NotifContent>
              )}
            </NotifBox>
          ))
        )}
      </NotificationsWrapper>
    </StyledContainer>
  );
}

export default Notifications;
