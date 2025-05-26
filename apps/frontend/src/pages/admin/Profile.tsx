import { Box, Grid, Typography, styled } from '@workspace/ui/src/lib/mui';
import { DashboardLayout, LoadingSpinner } from '@workspace/ui';
import { useEffect, useState } from 'react';

interface Role {
  id: number;
  userId: number;
  roleId: number;
  role: {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    modifiedAt: string;
    deletedAt: string | null;
  };
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  telephone: string;
  isVerified: boolean;
  otp: string | null;
  otpExpiry: string | null;
  profilePicture: string | null;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string | null;
  lastLogin: string | null;
  failedLoginAttempts: number;
  accountLocked: boolean;
  notificationPreferences: NotificationPreferences | null;
  roles: Role[];
}

const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const LabelText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return <LoadingSpinner />;

  return (
    <DashboardLayout title='Profile'>
      <Grid container>
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <InfoBox>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12}>
                <LabelText variant='h6'>Personal Information</LabelText>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Typography variant='body2'>First Name</Typography>
                <Typography variant='body1'>{user.firstName}</Typography>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Typography variant='body2'>Last Name</Typography>
                <Typography variant='body1'>{user.lastName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant='body2'>Email</Typography>
                <Typography variant='body1'>{user.email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant='body2'>Phone</Typography>
                <Typography variant='body1'>{user.telephone}</Typography>
              </Grid>
            </Grid>
          </InfoBox>

          <InfoBox>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12}>
                <LabelText variant='h6'>Account Information</LabelText>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Typography variant='body2'>Account Status</Typography>
                <Typography variant='body1'>{user.accountLocked ? 'Locked' : 'Active'}</Typography>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Typography variant='body2'>Verification Status</Typography>
                <Typography variant='body1'>
                  {user.isVerified ? 'Verified' : 'Not Verified'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant='body2'>Role</Typography>
                <Typography variant='body1'>{user.roles[0]?.role.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant='body2'>Member Since</Typography>
                <Typography variant='body1'>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </InfoBox>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default Profile;
