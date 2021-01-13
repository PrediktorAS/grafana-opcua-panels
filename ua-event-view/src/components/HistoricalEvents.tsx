import { PureComponent } from 'react';
import React from 'react';
import { DataFrame } from '@grafana/data';
import { DataGrid } from '../DataGrid/DataGrid';
//import { css, cx } from 'emotion';
//import { stylesFactory, useTheme } from '@grafana/ui';

interface Props {
  dataframe: DataFrame
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
    //const instanceId = this.props.replaceVariables('$ObjectId');
    return (<DataGrid data={this.props.dataframe} width={600} height={600} />);
  }
}
