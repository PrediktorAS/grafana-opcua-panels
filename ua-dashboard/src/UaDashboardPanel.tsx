import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory} from '@grafana/ui';
//import { getLocationSrv } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

export const UaDashboardPanel: React.FC<Props> = ({ options, data, width, height, replaceVariables}) => {
  //const theme = useTheme();
  const styles = getStyles();

  const instanceId = replaceVariables('$InstanceId')

  //const fromDate = replaceVariables('$_fromTime');
  //const toDate = replaceVariables('$_toTime');

  //getLocationSrv().update({

  //  query: {
  //    'var-__from': fromDate,
  //  },
  //  partial: true,
  //  replace: true,

  //})

  //getLocationSrv().update({

  //  query: {
  //    'var-__to': toDate,
  //  },
  //  partial: true,
  //  replace: true,

  //})

  const fromDate = replaceVariables('$__from');
  const toDate = replaceVariables('$__to');

  let url = replaceVariables('$DashboardUrl?kiosk&from=' + fromDate + '&to=' + toDate + '&var-ObjectId=' + instanceId);
  //let url = replaceVariables('$DashboardUrl?kiosk&from=now-1h&to=now');
  //let url = replaceVariables('$DashboardUrl');

  const dashboardUrlText = replaceVariables('Current url: ' + url);

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
      <div>{dashboardUrlText}</div>
      <div>{instanceId}</div>
    </div>
  );
};

//const updateToFromTime => {

//  const fromDate = this.props.replaceVariables('$__from');
//  const toDate = this.props.replaceVariables('$__to');

//  getLocationSrv().update({

//    query: {
//      'var-_fromTime': fromDate,
//    },
//    partial: true,
//    replace: true,

//  })

//  getLocationSrv().update({

//    query: {
//      'var-_toTime': toDate,
//    },
//    partial: true,
//    replace: true,

//  })


//}

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
