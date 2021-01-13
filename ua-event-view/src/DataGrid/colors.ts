import tinycolor from 'tinycolor2';
import lightTheme from '@grafana/ui';
import darkTheme from '@grafana/ui';

export function getTextColorForBackground(color: string) {
  const b = tinycolor(color).getBrightness();
  let lcolors: any = lightTheme.colors;
  let dcolors: any = darkTheme.colors;
  return b > 180 ? lcolors.textStrong : dcolors.textStrong;
}


