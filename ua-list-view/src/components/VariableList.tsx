import React, { Component } from 'react';
import { OpcUaBrowseResults, /*QualifiedName,*/ NodeClass, BrowseFilter, OpcUaNodeInfo } from '../types';
import { ThemeGetter } from './ThemesGetter';
import { DataFrame, DataQueryResponse, GrafanaTheme } from '@grafana/data';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { /*copyQualifiedName,*/ qualifiedNameToString } from '../utils/QualifiedName';
import { nodeClassToString } from '../utils/Nodeclass';

type Props = {
  browse: (nodeId: string, browseFilter: BrowseFilter) => Promise<OpcUaBrowseResults[]>;
  query(nodes: OpcUaBrowseResults[], handleQueryResult: (response: DataQueryResponse) => void) : void;
  parentNode: OpcUaNodeInfo;
};

type State = {
  fetchingChildren: boolean;
  fetchedChildren: boolean;
  fetchedValues: boolean;
  currentNode: OpcUaNodeInfo;
  children: OpcUaBrowseResults[];
  values: VT[];
  theme: GrafanaTheme | null;
  //browsePath: OpcUaBrowseResults[];
  maxResults: number;
  browseNameFilter: string;
};

interface VT {
  val: any | null,
  time: any | null
}


export class VariableList extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      currentNode: {
        browseName: { name: '', namespaceUrl: '' },
        displayName: '',
        nodeClass: -1,
        nodeId: '',
      },
      children: [],
      values: [],
      fetchingChildren: false,
      fetchedChildren: false,
      fetchedValues: false,
      theme: null,
      //browsePath: [],
      maxResults: 1000,
      browseNameFilter: '',
    };
  }


  //getBrowsePath(node: OpcUaBrowseResults): QualifiedName[] {
  //  let bp = this.state.browsePath.map(a => copyQualifiedName(a.browseName)).slice();
  //  bp.push(copyQualifiedName(node.browseName));
  //  return bp;
  //}

  forceFetchChildren() {
    if (!this.state.fetchingChildren) {
      this.setState({
        fetchingChildren: true
      }, () => {
        let filter: BrowseFilter = { browseName: this.state.browseNameFilter, maxResults: this.state.maxResults };
        this.props.browse(this.state.currentNode.nodeId, filter).then(response => {
          this.setState({ children: response, fetchingChildren: false, fetchedChildren: true });
        }).catch(() => this.setState({ children: [], fetchingChildren: false, fetchedChildren: false }));
      });
    }
  }

  fetchChildren() {
    if (!this.state.fetchedChildren && this.state.currentNode.nodeId.length > 0) {
      this.forceFetchChildren();
    }
  }


  onTheme = (theme: GrafanaTheme) => {
    if (this.state.theme == null && theme != null) {
      this.setState({ theme: theme });
    }
  };

  onQueryComplete(result: DataQueryResponse) {
    let vt: VT[] = [];
    for (let i = 0; i < result.data.length; i++) {
      var df = result.data[i] as DataFrame;
      let time = df.fields[0].values.get(0);
      let val = df.fields[1].values.get(0);
      vt.push({ time: time, val: val });
    }
    this.setState({ values: vt, fetchedValues: true });
  }

  render() {

    const rootNodeId = this.props.parentNode;
    if (this.state.currentNode.nodeId === '') {
      this.setState({ children: [], fetchingChildren: false, fetchedChildren: false, currentNode: rootNodeId, fetchedValues: false });
    }

    let bg = '';
    let txt = '';
    //let bgBlue: string = "";
    if (this.state.theme != null) {
      bg = this.state.theme.colors.bg2;
      txt = this.state.theme.colors.text;
      //bgBlue = this.state.theme.colors.bgBlue1;
    }

    this.fetchChildren();
    if (this.state.children !== null && this.state.children.length > 0 && !this.state.fetchedValues) {
      this.props.query(this.state.children, (respons) => this.onQueryComplete(respons));
    }
    return (

      <div className="panel-container">
        <ThemeGetter onTheme={this.onTheme} />
        <Paper >
          <Table>
            <TableHead style={{ backgroundColor: bg, color: txt }}>
              <TableRow style={{ height: 20 }}>
                <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>DisplayName</TableCell>
                <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Browse name</TableCell>
                <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Node Class</TableCell>
                <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Value</TableCell>
                <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{ backgroundColor: bg, color: txt }}>
              {this.state.children.map((row: OpcUaBrowseResults, index: number) => (
                <TableRow style={{ height: 14 }} key={index}>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {row.displayName}
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {qualifiedNameToString(row.browseName)}
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {nodeClassToString(row.nodeClass as NodeClass)}
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {index < this.state.values.length ? this.state.values[index].val : "" }
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {index < this.state.values.length ? this.state.values[index].time : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>);
  }
}
