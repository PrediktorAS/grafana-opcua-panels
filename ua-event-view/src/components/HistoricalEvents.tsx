import { PureComponent } from 'react';
import React from 'react';
import { ColDef, DataGrid, RowProps } from '@material-ui/data-grid';
//import { css, cx } from 'emotion';
//import { stylesFactory, useTheme } from '@grafana/ui';

interface Props {
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
    let cols: ColDef[] = [{ headerName: "Name", field: "name" }];
    let row: any = { rowIndex: 0, id: "name", selected: false, className:"", name: "hallo" };

    let rows: RowProps[] = [row];
    return (<DataGrid
      columns={cols}
      rows={rows}
    />);
  }
}
