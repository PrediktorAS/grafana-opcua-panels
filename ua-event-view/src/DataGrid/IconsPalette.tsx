import React from 'react';
import { Themeable } from '@grafana/ui';
import { IconsGroup } from './IconsGroup';
import { alarmIconIds } from './IconRenderer';


export interface IconsPaletteProps extends Themeable {
  onChange: (id: number) => void;
}

export const IconsPalette = ({ onChange, theme }: IconsPaletteProps) => {
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

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gridRowGap: '15px',
          gridColumnGap: '15px',
        }}
      >
        {alarmIcons}
      </div>
    </div>
);
};
