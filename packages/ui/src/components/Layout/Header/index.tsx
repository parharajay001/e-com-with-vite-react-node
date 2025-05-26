import { AppBar, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch } from '@workspace/store';
import { toggleTheme, toggleSidebar } from '@workspace/store';
import { useNavigate } from '@workspace/router';

const Header = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };
  return (
    <AppBar position='fixed'>
      <Toolbar variant='dense'>
        <IconButton color='inherit' edge='start' onClick={() => dispatch(toggleSidebar())}>
          <MenuIcon />
        </IconButton>
        <Typography variant='h6' color='text' sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        <IconButton color='inherit' onClick={() => dispatch(toggleTheme())}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <IconButton color='inherit' onClick={logout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
