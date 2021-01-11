import { PanelPlugin } from '@grafana/data';
import { UAAEPanelOptions } from './types';
import { UAAEPanel } from './UAAEPanel';

export const plugin = new PanelPlugin<UAAEPanelOptions>(UAAEPanel).setPanelOptions(builder => {
  return builder;
});
