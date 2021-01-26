import React from 'react';
import { Themeable } from '@grafana/ui';
import { IconsGroup } from './IconsGroup';
import { alarmIconIds } from './IconRenderer';


export interface IconsPaletteProps extends Themeable {
  id: number;
  onChange: (id: number) => void;
}

export const IconsPalette = ({ id, onChange, theme }: IconsPaletteProps) => {
  const alarmIcons: JSX.Element[] = [];

  alarmIconIds.forEach((id, index, alarmIconIds) => {
    alarmIcons.push(
      <IconsGroup
        theme={theme}
        selectedId={id}
        ids={alarmIconIds}
        onIconSelect={
          (id) => {
            onChange(id);
          }}
      />
    );
  });


  //let iconRenderer = new IconRenderer(id, (id) => onChange(id));

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridRowGap: '24px',
          gridColumnGap: '24px',
        }}
      >
        {alarmIcons}
        </div>
      </div>
  );
};
