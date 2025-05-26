import { Box, Breadcrumbs, Link, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink, useLocation } from '@workspace/router';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export const DashboardLayout = ({ title, children }: DashboardLayoutProps) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x); // Filter out empty strings from the pathnames array

  return (
    <Stack spacing={{ xs: 1, sm: 1.5, md: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Typography variant='h4' component='h1' fontWeight={600}>
          {title}
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />}>
          <Link component={RouterLink} to='/admin' color='inherit'>
            Home
          </Link>
          {pathnames.slice(1).map((name, index) => {
            const routeTo = `/admin/${pathnames.slice(1, index + 2).join('/')}`; // Construct the route to the current item
            const isLast = index === pathnames.slice(1).length - 1; // Check if it's the last item in the array

            return isLast ? (
              <Typography key={name} color='text.primary'>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
            ) : (
              <Link key={name} component={RouterLink} to={routeTo} color='inherit'>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
      {children}
    </Stack>
  );
};

export default DashboardLayout;
