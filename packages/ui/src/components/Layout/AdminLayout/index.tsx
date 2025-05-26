import { Box, useTheme } from '@mui/material';
import { Outlet } from '@workspace/router';
import Header from '../Header';
import Sidebar from '../Sidebar';

const AdminLayout = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Box sx={{ height: '40px' }} /> {/* Toolbar spacer */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
