import React, { Component } from 'react';
import { OpcUaBrowseResults, /*QualifiedName,*/ NodeClass, BrowseFilter, OpcUaNodeInfo, ColumnType } from '../types';
import { ThemeGetter } from './ThemesGetter';
import { DataFrame, DataQueryResponse, dateTime, GrafanaTheme, localTimeFormat } from '@grafana/data';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { /*copyQualifiedName,*/ qualifiedNameToString } from '../utils/QualifiedName';
import { nodeClassToString } from '../utils/Nodeclass';

type Props = {
  browse: (nodeId: string, nodeclass: NodeClass, browseFilter: BrowseFilter) => Promise<OpcUaBrowseResults[]>;
  query(nodes: OpcUaNodeInfo[], handleQueryResult: (response: DataQueryResponse) => void) : void;
  parentNode: OpcUaNodeInfo;
  columns: ColumnType;
  depth: number;
  showAllVariablesToDepth: boolean;
  refreshRate: number;
  maxResults: number;
};

type State = {
  fetchingChildren: boolean;
  fetchedChildren: boolean;
  fetchedValues: boolean;
  rootNode: BrowseHierarchy;
  valueList: VariableValue[];
  theme: GrafanaTheme | null;
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

interface BrowseContext {
  variableCount: number,
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
      theme: null,
    };

    let e = this;

    if (this.props.refreshRate > 0)
      setInterval(() => e.setState({ fetchedValues: false }), this.props.refreshRate * 1000);
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
        if (currchildren.length > 0 && depth < this.props.depth) {
          for (let i = 0; i < currchildren.length; i++) {
            stack.push({ node: currchildren[i], depth: depth + 1, parentNode: stParent });
          }
        }
        if ((depth == this.props.depth || this.props.showAllVariablesToDepth) && stParent.node.node.nodeClass == NodeClass.Variable) {
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



  fetchChildHierarchies(nodes: OpcUaBrowseResults[], depth: number, browseContext: BrowseContext): Promise<BrowseHierarchy[]> {
    if (depth > 0) {
      let promises: Promise<BrowseHierarchy>[] = [];
      depth--;
      for (let i = 0; i < nodes.length; i++) {
        if (browseContext.variableCount < this.getMaxElements()) {
          if (nodes[i].nodeClass == NodeClass.Variable)
            browseContext.variableCount++;
          promises.push(this.fetchHierarchy(nodes[i], depth, browseContext));
        }
        else
          break;
      }
      return Promise.all(promises);
    }
    let empty: BrowseHierarchy[] = []
    return new Promise<BrowseHierarchy[]>((res, rej) => res(empty));
  }

  getMaxElements(): number {
    if (this.props.maxResults > 0)
      return this.props.maxResults;
    return 2147483647;
  }


  fetchHierarchy(parent: OpcUaNodeInfo, depth: number, browseContext: BrowseContext): Promise<BrowseHierarchy> {
    let filter: BrowseFilter = { browseName: "", maxResults: this.props.maxResults }; // Not actually used right now.

    let nodeClass: NodeClass = (depth === 0) ? NodeClass.Variable : NodeClass.Object | NodeClass.Variable;
    if (browseContext.variableCount < this.getMaxElements()) {
      let prom = this.props.browse(parent.nodeId, nodeClass, filter);
      return prom.then(results => {
        const childHi = this.fetchChildHierarchies(results, depth, browseContext);
        return childHi.then(h => {
          let bh: BrowseHierarchy = { node: parent, children: h };
          return bh;
        })
      });
    }
    let empty: BrowseHierarchy = { children: [], node: parent };
    return new Promise<BrowseHierarchy>((res, rej) => res(empty));
  }


  forceFetchChildren() {
    if (!this.state.fetchingChildren) {
      this.setState({
        fetchingChildren: true
      }, () => {
          
          let browseContext: BrowseContext = { variableCount: 0 };
          this.fetchHierarchy(this.state.rootNode.node, this.props.depth, browseContext)
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
      if (df.refId !== undefined) {
        let idx = parseInt(df.refId);
        let timeMs = parseInt(df.fields[0].values.get(0));
        if (!isNaN(timeMs)) {

          let time = dateTime(timeMs).format(localTimeFormat({
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }));
          let val = df.fields[1].values.get(0);
          if (idx < vlist.length)
            vlist[idx].value = { time: time, val: val };
        }
      }
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
        <Paper style={{ position: "relative", height: "100%", width: "100%" }}>
          <div
            data-id="Treeview-ScrollDiv"

            style={{
              background: bg,
              height: "100%",
              overflowX: "auto",
              overflowY: "auto"
            }}
          >
          <Table>
            <TableHead style={{ backgroundColor: bg, color: txt }}>
              <TableRow style={{ height: 20 }}>
                {(this.props.columns & ColumnType.DisplayNamePath) == ColumnType.DisplayNamePath &&
                  <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>DisplayName</TableCell>
                }
                {(this.props.columns & ColumnType.BrowseName) == ColumnType.BrowseName &&
                  <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Browse name</TableCell>
                }
                {(this.props.columns & ColumnType.NodeClass) == ColumnType.NodeClass &&
                  <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Node Class</TableCell>
                }
                {(this.props.columns & ColumnType.Value) == ColumnType.Value &&
                  <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Value</TableCell>
                }
                {(this.props.columns & ColumnType.Time) == ColumnType.Time &&
                  <TableCell style={{ color: txt, border: 0, padding: 2, whiteSpace: 'nowrap' }}>Time</TableCell>
                }
              </TableRow>
            </TableHead>
            <TableBody style={{ backgroundColor: bg, color: txt }}>
              {this.state.valueList.map((row: VariableValue, index: number) => (
                <TableRow style={{ height: 14 }} key={index}>
                  {(this.props.columns & ColumnType.DisplayNamePath) == ColumnType.DisplayNamePath &&
                    <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                      {row.name}
                    </TableCell>
                  }
                  {(this.props.columns & ColumnType.BrowseName) == ColumnType.BrowseName &&
                    <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                      {qualifiedNameToString(row.node.browseName)}
                    </TableCell>
                  }
                  {(this.props.columns & ColumnType.NodeClass) == ColumnType.NodeClass &&
                    <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                      {nodeClassToString(row.node.nodeClass as NodeClass)}
                    </TableCell>
                  }
                  {(this.props.columns & ColumnType.Value) == ColumnType.Value &&
                    <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                      {row.value?.val}
                    </TableCell>
                  }
                  {(this.props.columns & ColumnType.Time) == ColumnType.Time &&
                    <TableCell style={{ color: txt, border: 0, padding: 2 }} >
                      {row.value?.time}
                    </TableCell>
                  }
                </TableRow>
              ))}
            </TableBody>
            </Table>
            </div>
        </Paper>
      </div>);
  }
}
