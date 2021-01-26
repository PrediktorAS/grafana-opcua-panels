import React from 'react';
import { Themeable } from '@grafana/ui';
import { IconRenderer } from './IconRenderer';



export interface IconsGroupProps extends Themeable {
  selectedId: number;
  ids: number[];
  onIconSelect: (id: number) => void;
}

export const IconsGroup = ({ selectedId, ids, onIconSelect, theme }: IconsGroupProps) => {

  let iconRenderer = new IconRenderer(selectedId, onIconSelect);

  return (
    <div>
      {iconRenderer.render()}
    </div>
  );


};
