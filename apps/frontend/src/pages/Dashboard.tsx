import { Typography } from '@workspace/ui/src/lib/mui';
import { DashboardLayout } from '@workspace/ui';

export const Dashboard = () => {
  return (
    <DashboardLayout title='Dashboard'>
      <Typography component='p'>Welcome to your dashboard!</Typography>
    </DashboardLayout>
  );
};

export default Dashboard;
