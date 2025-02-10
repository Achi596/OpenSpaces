import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AppBar, Toolbar, InputBase, Button } from '@mui/material';
import styled from '@emotion/styled';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

// Shared styles for buttons
const buttonStyles = {
  color: 'white',
  height: '100%',
  backgroundColor: 'black',
  border: 'black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: '#242424',
    borderColor: 'black',
  },
};

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'black',
});

const SearchBar = styled(InputBase)({
  backgroundColor: 'white',
  color: 'grey',
  borderRadius: '25px',
  padding: '5px 15px',
  marginLeft: '5px',
  flex: 1,
});

const IconButton = styled(Button)(({ theme }) => ({
  ...buttonStyles,
  width: '11%',
  minWidth: '50px',
  '@media (max-width: 768px)': {
    display: 'flex',
  },
  '@media (min-width: 769px)': {
    display: 'none',
  },
}));

const TextButton = styled(Button)(({ theme }) => ({
  ...buttonStyles,
  width: '11%',
  minWidth: '117px',
  '@media (max-width: 768px)': {
    display: 'none',
  },
  '@media (min-width: 769px)': {
    display: 'flex',
  },
}));

const MenuIconButton = styled(Button)(({ theme }) => ({
  ...buttonStyles,
  width: '11%',
  minWidth: '50px',
  '@media (max-width: 768px)': {
    display: 'flex',
  },
  '@media (min-width: 769px)': {
    display: 'none',
  },
}));

const MenuTextButton = styled(Button)(({ theme, sidebarOpen }) => ({
  ...buttonStyles,
  width: sidebarOpen ? '30%' : '10%',
  maxWidth: '240px',
  justifyContent: 'flex-start',
  marginRight: '10px',
  marginLeft: '0px',
  paddingLeft: '0px',
  '@media (max-width: 768px)': {
    display: 'none',
  },
  '@media (min-width: 769px)': {
    display: 'flex',
  },
}));

function Nav(props) {
  const token = Cookies.get('token');
  const nav = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      nav(`/search?query=${searchTerm}`);
    }
  };

  const handleLogout = async () => {
    if (window.innerWidth < 769 && props.sidebarOpen) {
      props.onMenuClick();
    }
    if (!token) {
      alert('No user is logged in');
      nav('/login');
      return;
    }

    try {
      Cookies.remove('token');
      nav('/');
      const response = await fetch(
        `${url}user/logout?token=${token}`,
        { method: 'GET' }
      );

      if (response.ok) {
        console.error('Log out successful!');
      } else {
        const data = await response.json();
        console.error(data.error || 'Failed to log out');
        alert(data.error || 'Failed to log out');
      }
    } catch (error) {
      alert('There was an error logging out!');
      console.error('There was an error logging out!', error);
    }
  };

  const handleClick = (path) => {
    if (window.innerWidth < 769 && props.sidebarOpen) {
      props.onMenuClick();
    }
    nav(path);
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <MenuIconButton
          variant="contained"
          startIcon={props.sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          onClick={props.onMenuClick}
        />
        <MenuTextButton
          variant="contained"
          startIcon={props.sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          onClick={props.onMenuClick}
          sidebarOpen={props.sidebarOpen}
        >
          {props.sidebarOpen ? '' : 'Menu'}
        </MenuTextButton>
        <SearchBar
          placeholder="Find a Space"
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {!token && (
          <>
            <IconButton
              variant="contained"
              endIcon={<LoginIcon />}
              onClick={() => handleClick('/login')}
            />
            <IconButton
              variant="contained"
              endIcon={<PersonAddAlt1Icon />}
              onClick={() => handleClick('/signup')}
            />
            <TextButton
              variant="contained"
              endIcon={<LoginIcon />}
              onClick={() => handleClick('/login')}
            >
              Log In
            </TextButton>
            <TextButton
              variant="contained"
              endIcon={<PersonAddAlt1Icon />}
              onClick={() => handleClick('/signup')}
            >
              Sign Up
            </TextButton>
          </>
        )}
        {token && (
          <>
            <IconButton
              variant="contained"
              endIcon={<LogoutIcon />}
              onClick={handleLogout}
            />
            <TextButton
              variant="contained"
              endIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Log Out
            </TextButton>
          </>
        )}
      </Toolbar>
    </StyledAppBar>
  );
}

export default Nav;
