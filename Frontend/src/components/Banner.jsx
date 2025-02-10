import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';
import styled from '@emotion/styled';
import image from '../assets/UNSW_logo.png';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Cookies from 'js-cookie';

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'white',
  color: 'black',
});

const Logo = styled('img')({
  height: '50px',
  marginRight: '20px',
});

const ToolbarContainer = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const Title = styled(Typography)({
  fontFamily: '"Lucida Console", "Courier New", monospace',
  letterSpacing: '0.1em',
  fontSize: '24px',
  cursor: 'pointer',
  flex: '1 1 auto',
  textAlign: 'center',
  transform: 'scale(1.1)',
  transformOrigin: 'center',
});

function Banner() {
  const token = Cookies.get('token');
  const userRole = Cookies.get('role');
  const isAdmin = userRole === 'Admin';
  const nav = useNavigate();
  return (
    <StyledAppBar position="static">
      <ToolbarContainer>
        <Logo
          src={image}
          alt="Logo"
          style={{ position: 'absolute', left: '20px' }}
        />
        <Title variant="h6" onClick={() => nav('/')}>
          OPEN SPACES
        </Title>
        {isAdmin && token && (
          <NotificationsIcon
            style={{ position: 'absolute', right: '20px', cursor: 'pointer' }}
            onClick={() => nav('/notifications')}
          />
        )}
      </ToolbarContainer>
    </StyledAppBar>
  );
}

export default Banner;
