import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory} from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

export const UaDashboardPanel: React.FC<Props> = ({ options, data, width, height, replaceVariables}) => {
  //const theme = useTheme();
  const styles = getStyles();

  const instanceId = replaceVariables('$InstanceId');

  const fromDate = replaceVariables('$__from');
  const toDate = replaceVariables('$__to');

  let url = replaceVariables('$DashboardUrl?kiosk&from=' + fromDate + '&to=' + toDate + '&var-ObjectId=' + instanceId);

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
