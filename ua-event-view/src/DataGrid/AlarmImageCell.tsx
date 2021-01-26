import { getTextColorForBackground } from '@grafana/ui';
import React, { FC } from 'react';
import { IconRenderer } from './IconRenderer';
import { TableCellProps, AlarmThresholdProps } from './types';

export const AlarmImageCell: FC<TableCellProps> = props => {
  const { field, cell, tableStyles, cellProps } = props;

  const dataValue = field.values.get(cell.row.index);
  const displayValue = field.display!(cell.value);
  const text = displayValue?.text;

  let iconColor = 'white';
  let iconId = 0;
  let iconRenderer: IconRenderer;

  let valueAsFloat = parseFloat(dataValue);
  if (valueAsFloat != undefined) { 

    let alarmThresholdProps = field.config.custom as AlarmThresholdProps;

    if (alarmThresholdProps != undefined) {
      //console.log("field.config.custom: " + field.config.custom.toString());
      let stepsSorted = alarmThresholdProps.alarmthresholds.sort((a, b) => {
        if (a.value == b.value)
          return 0;
        return a.value > b.value ? -1 : 1;
      });

      for (let i = 0; stepsSorted != undefined && i < stepsSorted?.length; i++) {
        let step = stepsSorted[i];
        if (step != undefined && valueAsFloat > step.value) {
          iconColor = step.color;
          iconId = step.iconId;
          break;
        }
      }
    }

  }

  iconRenderer = new IconRenderer(iconId, (id) => { });

  const textColor = getTextColorForBackground(cellProps.backgroundColor?.toString() ?? "black");

  //console.log("ImageCell: " + text + "  " + iconColor);

  let { translate, ...restProps } = { ...cellProps };


  return (

    <div {...restProps} className={tableStyles.cellContainer}>



      <div style={{ color: iconColor, paddingRight: '10px' }}>
        {iconRenderer.render()}
      </div >

      <div style={{ color: textColor }}>
        {text}
      </div>

    </div>
  );
};
