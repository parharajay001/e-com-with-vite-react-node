import { useEffect, useRef, memo, useMemo } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Avatar,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Link, useLocation } from '@workspace/router';
import {
  RootState,
  toggleMenuItem,
  toggleSidebar,
  useDispatch,
  useSelector,
} from '@workspace/store';
import { NavigationMenuItem } from '../../../types';
import { getIconComponent } from '../../../utils/iconMapping';

const DRAWER_WIDTH = 240;

const MenuItemComponent = memo(
  ({ item, level = 0 }: { item: NavigationMenuItem; level?: number }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { expandedMenuItems } = useSelector((state: RootState) => state.theme);

    const hasManualInteraction = useRef(false);

    const isActive = useMemo(() => {
      return item.link
        ?.split('/')
        .reverse()[0]
        .includes(location.pathname?.split('/').reverse()[0]);
    }, [item.link, location.pathname]);

    const hasActiveChild = useMemo(() => {
      return item.children?.some((child) =>
        child.link?.split('/').reverse()[0].includes(location.pathname?.split('/').reverse()[0]),
      );
    }, [item.children, location.pathname]);

    useEffect(() => {
      if (
        hasActiveChild &&
        !expandedMenuItems.includes(item.key) &&
        !hasManualInteraction.current
      ) {
        dispatch(toggleMenuItem(item.key));
      }
    }, [location.pathname, hasActiveChild, expandedMenuItems, item.key, dispatch]);

    const isExpanded = expandedMenuItems.includes(item.key);

    const handleClick = () => {
      if (item.children) {
        hasManualInteraction.current = true;
        dispatch(toggleMenuItem(item.key));
      }
    };

    const textColor = { color: isActive || hasActiveChild ? 'primary.main' : 'text' };
    const itemPadding = { pl: level * 2 + 2 };

    const IconComponent = getIconComponent(item.icon);

    const renderIcon = () => (
      <ListItemIcon>
        <Typography sx={textColor}>
          <IconComponent />
        </Typography>
      </ListItemIcon>
    );

    const renderExpandIcon = () =>
      item.children && (
        <Typography sx={textColor}>{isExpanded ? <ExpandLess /> : <ExpandMore />}</Typography>
      );

    const renderContent = () => (
      <>
        {renderIcon()}
        <ListItemText>
          <Typography sx={textColor}>{item.title}</Typography>
        </ListItemText>
        {renderExpandIcon()}
      </>
    );

    return (
      <>
        {item.link ? (
          <Link to={item.link}>
            <ListItem
              button
              selected={isActive}
              sx={itemPadding}
              onClick={() => dispatch(toggleSidebar())}
            >
              {renderContent()}
            </ListItem>
          </Link>
        ) : (
          <ListItem button onClick={handleClick} sx={itemPadding}>
            {renderContent()}
          </ListItem>
        )}
        {item.children && (
          <Collapse in={isExpanded} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              {item.children.map((child) => (
                <MenuItemComponent key={child.key} item={child} level={level + 1} />
              ))}
            </List>
          </Collapse>
        )}
      </>
    );
  },
);

const Sidebar = memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.theme);
  const { menuItems } = useSelector((state: RootState) => state.common);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <Drawer
      variant='temporary'
      open={sidebarOpen}
      anchor='left'
      onClose={() => dispatch(toggleSidebar())}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Stack direction='row' spacing={2} alignItems='center' sx={{ padding: `5px 20px` }}>
        <Avatar
          alt={`${user && user?.firstName}${user && user?.lastName}`}
          src={user?.profilePicture}
          sx={{ fontSize: 16 }}
        >
          {user && user?.firstName[0]}
          {user && user?.lastName[0]}
        </Avatar>
        <Typography variant='h6' color='text.primary'>
          {user && user?.firstName} {user && user?.lastName}
        </Typography>
      </Stack>
      <List sx={{ mt: '0px', padding: 0 }}>
        {menuItems.map((item) => (
          <MenuItemComponent key={item.key} item={item} />
        ))}
      </List>
    </Drawer>
  );
});

export default Sidebar;
