import { getTextColorForBackground } from '@grafana/ui';
import React, { FC } from 'react';
import { IconRenderer } from './IconRenderer';
import { AlarmThresholdProps, TableCellProps } from './types';

export const BooleanImageCell: FC<TableCellProps> = props => {
  const { field, cell, tableStyles, cellProps } = props;

  //console.log("BooleanImageCell: " + field.values.get(cell.row.index));

  const dataValue = field.values.get(cell.row.index);
  const displayValue = field.display!(cell.value);
  const text = displayValue?.text;

  let iconColor = 'white';

  let valueAsBoolean = dataValue.length === 4;
  let booleanAsInt = valueAsBoolean ? 1 : 0;
  let iconId = 0;
  let iconRenderer: IconRenderer;

  let alarmThresholdProps = field.config.custom as AlarmThresholdProps;

  if (alarmThresholdProps != undefined) {
    //console.log("field.config.custom: " + field.config.custom.toString());
    let stepsSorted = alarmThresholdProps.alarmthresholds.sort((a, b) => {
      if (a.value == b.value)
        return 0;
      return a.value < b.value ? -1 : 1;
    });

    for (let i = 0; stepsSorted != undefined && i < stepsSorted?.length; i++) {
      let step = stepsSorted[i];

      if (step != undefined) {
        if (booleanAsInt == 0 && step.value == -Infinity) {
          iconColor = step.color;
          iconId = step.iconId;
        }
        else if (booleanAsInt == step.value) {
          iconColor = step.color;
          iconId = step.iconId;
        }
      }
    }
  }

  iconRenderer = new IconRenderer(iconId);

  const textColor = getTextColorForBackground(cellProps.backgroundColor?.toString() ?? "black");

  //console.log("BooleanImageCell: " + text + "  " + iconColor);

  let { translate, ...restProps } = { ...cellProps };

  return (

    <div {...restProps} className={tableStyles.cellContainer}>

      <div style={{ color: iconColor, paddingRight: '4px' }}>
        {iconRenderer.render()}
      </div >
      <div style={{ color: textColor }}>
        {text}
      </div>

    </div>
  );
};
