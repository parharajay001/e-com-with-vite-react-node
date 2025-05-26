import { Box, Typography } from '@workspace/ui/src/lib/mui';

export default function PageNotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant='h4'>404 Page Not Found</Typography>
    </Box>
  );
}
