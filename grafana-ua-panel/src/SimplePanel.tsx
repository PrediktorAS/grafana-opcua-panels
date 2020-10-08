import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';
//import { getDataSourceSrv, DataSourceSrv } from '@grafana/runtime';
//import { DataSourceWithBackend } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> { }

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();
//  const backendSrv = getBackendSrv();

  let color: string;
  switch (options.color) {
    case 'red':
      color = theme.palette.redBase;
      break;
    case 'green':
      color = theme.palette.greenBase;
      break;
    case 'blue':
      color = theme.palette.blue95;
      break;
  }
  //options.datasource.getResource(nodeId).then((results: OpcUaBrowseResults[]) => {
  //  return results.map((item: OpcUaBrowseResults) => ({
  //    label: item.displayName,
  //    key: item.nodeId,
  //    description: item.displayName,
  //    value: item,
  //  }));
  //});

  //<div>Data fetched from backend: {backendSrv.datasourceRequest({
  //  url: 'api/request',
  //  method: 'query'
  //})
  //}</div>

  //let myNode:string = "not found";
  //var datasourceName = data.request?.targets[0].datasource;
  //getDataSourceSrv().get(datasourceName).then((result) => {

  //  var dataSourceWithBackend = result as DataSourceWithBackend;
  //  var nodeId = "i=85";
  //  dataSourceWithBackend.getResource('browse', { nodeId: nodeId }).then((r) => {
  //    myNode = r.toString();
  //  })
  //})

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
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
      >
        <g>
          //<circle style={{ fill: `${theme.isLight ? theme.palette.greenBase : theme.palette.yellow}` }} r={100} />
          <circle style={{ fill: color }} r={100} />
        </g>
      </svg>

      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${theme.typography.size[options.seriesCountSize]};
            `}
          >
            Number of series: {data.series[0].length}
          </div>
        )}
        <div>Text option value: {options.text}</div>
      </div>
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
