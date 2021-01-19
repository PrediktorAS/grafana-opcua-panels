import { getTextColorForBackground } from '@grafana/ui';
import React, { FC } from 'react';
import { TableCellProps } from './types';

export const BooleanImageCell: FC<TableCellProps> = props => {
  const { field, cell, tableStyles, cellProps } = props;

  //console.log("BooleanImageCell: " + field.values.get(cell.row.index));

  const dataValue = field.values.get(cell.row.index);
  const displayValue = field.display!(cell.value);
  const text = displayValue?.text;

  let iconColor = 'white';

  let valueAsBoolean = dataValue.length === 4;
  let booleanAsInt = valueAsBoolean ? 1 : 0;

  let stepSorted = field.config.thresholds?.steps.sort(s => s.value);

  for (let i = 0; stepSorted != undefined && i < stepSorted?.length; i++) {
    let step = field.config.thresholds?.steps[i];

    if (step != undefined) {
      if (booleanAsInt == 0 && step.value == -Infinity) {
        iconColor = step.color;
      }
      else if (booleanAsInt == step.value) {
        iconColor = step.color;
      }
    }
  }

  const textColor = getTextColorForBackground(cellProps.backgroundColor?.toString() ?? "black");

  console.log("BooleanImageCell: " + text + "  " + iconColor);

  let { translate, ...restProps } = { ...cellProps };

  return (

    <div {...restProps} className={tableStyles.cellContainer}>

      <div style={{ color: iconColor }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
        </svg>
      </div>
      <div style={{ color: textColor }}>
        {text}
      </div>

    </div>
  );
};
