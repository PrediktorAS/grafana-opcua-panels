import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory} from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

export const UaDashboardPanel: React.FC<Props> = ({ options, data, width, height, replaceVariables}) => {
  //const theme = useTheme();
  const styles = getStyles();

  const instanceId = replaceVariables('$InstanceId')
  //this.event
  const query = replaceVariables('Now displaying $InstanceId')

  let url;

  if (instanceId == "EquipmentType") {
    url = "/d/1VFKB3FGz/my-dashboard";
  }
  else {
    url = "/d/IYY1f5vGk/new-dashboard-copy";
  }

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <iframe src={url} width={width} height={height} frameBorder="0">
      </iframe>
      <div>{query}</div>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
