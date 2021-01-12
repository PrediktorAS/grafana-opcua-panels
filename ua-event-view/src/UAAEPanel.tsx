import { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { UAAEPanelOptions } from 'types';
import React from 'react';
import { RealtimeEvents } from './components/RealtimeEvents';
import { HistoricalEvents } from './components/HistoricalEvents';
//import { css, cx } from 'emotion';
//import { stylesFactory, useTheme } from '@grafana/ui';

interface Props extends PanelProps<UAAEPanelOptions> {}
interface State {
}

export class UAAEPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    //const instanceId = this.props.replaceVariables('$ObjectId');
    return <div className="panel-container" style={{ width: '100' }}>
      {this.props.data.series.map((dFrame, index) => {
        if (this.props.options.panelType === 'realtime') {
          return (<RealtimeEvents></RealtimeEvents>);
        }
        else {
          return (<HistoricalEvents dataframe={ dFrame } ></HistoricalEvents>);
        }

      })}
    </div>
    

  }
}
