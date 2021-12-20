import palette from '../theme/palette';
import { ThemeColorPresets } from '../components/settings/type';

export const colorPresets = [
  {
    name: 'icy-road',
    lighter: '#D1FFFC',
    light: '#76F2FF',
    main: '#f9c415',
    dark: '#0E77B7',
    darker: '#28507c',
    contrastText: palette.light.grey[800],
  },
];

export const icyPreset = colorPresets[0];

export default function getColorPresets(presetsKey: ThemeColorPresets) {
  return {
    'icy-road': icyPreset,
  }[presetsKey];
}
