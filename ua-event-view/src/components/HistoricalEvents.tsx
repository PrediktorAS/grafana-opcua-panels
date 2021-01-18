import { PureComponent } from 'react';
import React from 'react';
import { DataFrame } from '@grafana/data';
import { DataGrid } from '../DataGrid/DataGrid';
//import { css, cx } from 'emotion';
//import { stylesFactory, useTheme } from '@grafana/ui';

interface Props {
  dataframe: DataFrame
  height: number
  width: number
}
interface State {
}

export class HistoricalEvents extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {


    return (<DataGrid data={this.props.dataframe} width={this.props.width} height={this.props.height} />);
  }
}
