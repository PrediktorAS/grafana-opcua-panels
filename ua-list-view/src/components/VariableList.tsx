import React, { Component } from 'react';
import { OpcUaBrowseResults, /*QualifiedName,*/ NodeClass, BrowseFilter, OpcUaNodeInfo } from '../types';
import { ThemeGetter } from './ThemesGetter';
import { DataFrame, DataQueryResponse, GrafanaTheme } from '@grafana/data';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { /*copyQualifiedName,*/ qualifiedNameToString } from '../utils/QualifiedName';
import { nodeClassToString } from '../utils/Nodeclass';

type Props = {
  browse: (nodeId: string, nodeclass: NodeClass, browseFilter: BrowseFilter) => Promise<OpcUaBrowseResults[]>;
  query(nodes: OpcUaNodeInfo[], handleQueryResult: (response: DataQueryResponse) => void) : void;
  parentNode: OpcUaNodeInfo;
};

type State = {
  fetchingChildren: boolean;
  fetchedChildren: boolean;
  fetchedValues: boolean;
  rootNode: BrowseHierarchy;
  valueList: VariableValue[];
  depth: number,
  theme: GrafanaTheme | null;
  maxResults: number;
  browseNameFilter: string;
};

interface VariableValue {
  node: OpcUaNodeInfo,
  value: VT | null,
  name: string
}

interface VT {
  val: any | null,
  time: any | null
}

interface BrowseHierarchy {
  node: OpcUaNodeInfo,
  children: BrowseHierarchy[]
}

interface TreeNode {
  parentNode: TreeNode | null,
  node: BrowseHierarchy,
  depth: number,
}


export class VariableList extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      rootNode: {
        node: {
          browseName: { name: '', namespaceUrl: '' },
          displayName: '',
          nodeClass: -1,
          nodeId: '',
        },
        children: []
      },
      fetchingChildren: false,
      fetchedChildren: false,
      fetchedValues: false,
      valueList: [],
      depth: 2,
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

  onHierarchyComplete() {
    let children: VariableValue[] = [];
    let stack: TreeNode[] = [];
    stack.push({ node: this.state.rootNode, depth: 0, parentNode: null});
    while (stack.length > 0) {
      let stParent = stack.pop();
      if (typeof stParent !== 'undefined') {
        let depth = stParent.depth;
        let currchildren = stParent.node.children;
        if (currchildren.length > 0 && depth < this.state.depth) {
          for (let i = 0; i < currchildren.length; i++) {
            stack.push({ node: currchildren[i], depth: depth + 1, parentNode: stParent });
          }
        }
        if (depth == this.state.depth) {
          let names: string[] = [];
          names.push(stParent.node.node.displayName);
          let p = stParent.parentNode;
          while (p != null) {
            names.push(p.node.node.displayName);
            p = p.parentNode;
          }
          let varVal: VariableValue = { node: stParent.node.node, value: null, name: names.reverse().join("/")};
          children.push(varVal);
        }
      }
    }
    
    this.setState({
      valueList: children, fetchedValues: false
    });
  }



  fetchChildHierarchies(nodes: OpcUaBrowseResults[], depth: number): Promise<BrowseHierarchy[]> {
    if (depth > 0) {
      let promises: Promise<BrowseHierarchy>[] = [];
      depth--;
      for (let i = 0; i < nodes.length; i++) {
        promises.push(this.fetchHierarchy(nodes[i], depth));
      }
      return Promise.all(promises);
    }
    let empty: BrowseHierarchy[] = []
    return new Promise<BrowseHierarchy[]>((res, rej) => res(empty));
  }


  fetchHierarchy(parent: OpcUaNodeInfo, depth: number): Promise<BrowseHierarchy> {
    let filter: BrowseFilter = { browseName: this.state.browseNameFilter, maxResults: this.state.maxResults };

    let nodeClass: NodeClass = (this.state.depth == depth) ? NodeClass.Variable : NodeClass.Object | NodeClass.Variable;
    let prom = this.props.browse(parent.nodeId, nodeClass, filter);
    return prom.then(results => {
      const childHi = this.fetchChildHierarchies(results, depth);
      return childHi.then(h => {
        let bh: BrowseHierarchy = { node: parent, children: h };
        return bh;
      })
    });
  }


  forceFetchChildren() {
    if (!this.state.fetchingChildren) {
      this.setState({
        fetchingChildren: true
      }, () => {
          this.fetchHierarchy(this.state.rootNode.node, this.state.depth)
            .then(hier => this.setState({ rootNode: hier, fetchingChildren: false, fetchedChildren: true }, () => this.onHierarchyComplete()))
            .catch(() => this.setState({ fetchingChildren: false, fetchedChildren: false }));
      }
      );
    }
  }

  fetchChildren() {
    if (!this.state.fetchedChildren && this.state.rootNode.node.nodeId.length > 0) {
      this.forceFetchChildren();
    }
  }


  onTheme = (theme: GrafanaTheme) => {
    if (this.state.theme == null && theme != null) {
      this.setState({ theme: theme });
    }
  };

  onQueryComplete(result: DataQueryResponse) {

    let vlist = this.state.valueList.slice();
    for (let i = 0; i < result.data.length; i++) {
      var df = result.data[i] as DataFrame;
      let time = df.fields[0].values.get(0);
      let val = df.fields[1].values.get(0);
      if (i < vlist.length)
      vlist[i].value = { time: time, val: val };
    }
    this.setState({ valueList: vlist, fetchedValues: true });
  }

  render() {

    const rootNodeId = this.props.parentNode;
    if (this.state.rootNode.node.nodeId === '' || rootNodeId.nodeId !== this.state.rootNode.node.nodeId) {

      this.setState({ fetchingChildren: false, fetchedChildren: false, rootNode: { node: rootNodeId, children: [] }, fetchedValues: false });
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
    if (this.state.fetchedChildren && !this.state.fetchedValues && this.state.valueList.length > 0) {
      this.props.query(this.state.valueList.map(v => v.node), (respons) => this.onQueryComplete(respons));
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
              {this.state.valueList.map((row: VariableValue, index: number) => (
                <TableRow style={{ height: 14 }} key={index}>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {row.name}
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {qualifiedNameToString(row.node.browseName)}
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {nodeClassToString(row.node.nodeClass as NodeClass)}
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {row.value?.val}
                  </TableCell>
                  <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                    {row.value?.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>);
  }
}
