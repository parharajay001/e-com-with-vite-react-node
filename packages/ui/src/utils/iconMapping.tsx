import {
  AccountCircleOutlined as AccountCircle,
  CategoryOutlined as Category,
  DashboardOutlined as Dashboard,
  LocalShippingOutlined as LocalShipping,
  PeopleOutlined as People,
  PriceChangeOutlined as PriceChange,
  SettingsOutlined as Settings,
  ShoppingCartOutlined as ShoppingCart,
  StoreOutlined as Store,
  SupervisorAccountOutlined as SupervisorAccount,
} from '../lib/mui-icons';

const iconMap: { [key: string]: React.ComponentType } = {
  AccountCircle,
  Category,
  Dashboard,
  LocalShipping,
  People,
  PriceChange,
  Settings,
  ShoppingCart,
  Store,
  SupervisorAccount,
};

export const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || AccountCircle; // Default to AccountCircle if icon not found
};
