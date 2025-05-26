import { useLocation } from '@workspace/router';
import { Box, Typography } from '@workspace/ui/src/lib/mui';
export const Unauthoried = () => {
  const location = useLocation();
  const path = location?.state?.from?.state?.from?.pathname;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100% - 200px)',
      }}
    >
      <Typography variant='h4'>You don't have access to view this page - {path}</Typography>
    </Box>
  );
};

export default Unauthoried;
