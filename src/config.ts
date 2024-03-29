import { SettingsValueProps } from './components/settings/type';

export const DRAWER_WIDTH = 260;

export const DASHBOARD_HEADER_MOBILE = 64;
export const DASHBOARD_HEADER_DESKTOP = 92;
export const DASHBOARD_NAVBAR_WIDTH = 280;
export const DASHBOARD_NAVBAR_COLLAPSE_WIDTH = 88;

export const DASHBOARD_NAVBAR_ROOT_ITEM_HEIGHT = 48;
export const DASHBOARD_NAVBAR_SUB_ITEM_HEIGHT = 40;
export const DASHBOARD_NAVBAR_ICON_ITEM_SIZE = 22;


export const defaultSettings: SettingsValueProps = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeColorPresets: 'icy-road',
  themeStretch: false,
};
