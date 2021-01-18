import { getTextColorForBackground } from '@grafana/ui';
import React, { FC } from 'react';
import { TableCellProps } from './types';

export const ImageCell: FC<TableCellProps> = props => {
  const { field, cell, tableStyles, cellProps } = props;

  const displayValue = field.display!(cell.value);
  const text = displayValue?.text;

  let iconColor = 'green';

  let valueAsInt = parseInt(text);
  if (valueAsInt != undefined) { 

    let stepSorted = field.config.thresholds?.steps.sort(s => s.value);

    for (let i = 0; stepSorted != undefined && i < stepSorted?.length; i++) {
      let step = field.config.thresholds?.steps[i];
      if (step != undefined && valueAsInt > step.value) {
        iconColor = step.color;
      }
    }
  }

  const textColor = getTextColorForBackground(cellProps.backgroundColor?.toString() ?? "black");

  console.log("ImageCell: " + text + "  " + iconColor);

  let { translate, ...restProps } = { ...cellProps };

  return (

    <div {...restProps} className={tableStyles.cellContainer}>

      <div style={{ color: iconColor }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="css-sr6nr">
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <path d="M18.17,1.85h0A6.25,6.25,0,0,0,12.12.23L9.42,6.56l2.83.71a1,1,0,0,1,.67,1.41l-2,4a1,1,0,0,1-.9.56,1.13,1.13,0,0,1-.44-.1h0a1,1,0,0,1-.46-1.33l1.4-2.89-2.77-.7a1,1,0,0,1-.65-.53,1,1,0,0,1,0-.83L9.58,1a6.27,6.27,0,0,0-7.73,9.77L9.3,18.18a1,1,0,0,0,1.42,0h0l7.45-7.46A6.27,6.27,0,0,0,18.17,1.85Z">
              </path>
            </g>
          </g>
        </svg>
      </div>
      <div style={{ color: textColor }}>
        {text}
      </div>

    </div>
  );
};
