export interface BaseState {
  loading: boolean;
  error: string | null;
}

export interface NavigationMenuItem {
  title: string;
  key: string;
  link?: string;
  icon: string; // Changed from Icon: React.ComponentType
  active?: boolean;
  children?: NavigationMenuItem[];
}
