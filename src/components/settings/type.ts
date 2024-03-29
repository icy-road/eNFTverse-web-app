// ----------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark';
export type ThemeDirection = 'rtl' | 'ltr';
export type ThemeColorPresets = 'icy-road'
export type ThemeStretch = boolean;

type ColorVariants = {
  name: string;
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  contrastText: string;
};

export type SettingsValueProps = {
  themeMode: ThemeMode;
  themeDirection: ThemeDirection;
  themeColorPresets: ThemeColorPresets;
  themeStretch: ThemeStretch;
};

export type SettingsContextProps = {
  themeMode: ThemeMode;
  themeDirection: ThemeDirection;
  themeColorPresets: ThemeColorPresets;
  themeStretch: boolean;
  setColor: ColorVariants;
  colorOption: {
    name: string;
    value: string;
  }[];
  onToggleMode: VoidFunction;
  onChangeMode: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDirection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeColor: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleStretch: VoidFunction;
  onResetSetting: VoidFunction;
};
