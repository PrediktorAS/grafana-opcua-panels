import { PureComponent } from 'react';
import { FieldOverrideEditorProps } from '@grafana/data';
import React from 'react';
import { Button } from '@grafana/ui';
import { IconRenderer } from './IconRenderer';

export interface AlarmThreshold {
  iconId: number,
  color: string
}

interface State {
  dummy: string | null,
}

export class AlarmThresholdEditor extends PureComponent<FieldOverrideEditorProps<AlarmThreshold[], any>, State> {

  constructor(props: Readonly<FieldOverrideEditorProps<AlarmThreshold[], any>>) {
    super(props);
    this.state = { dummy: '1' };
  }

  render() {

    return (

      <div style={{ position: "relative", width: '100%'  }} >
        <Button className='css-1pcbsvw-button' style={{ position: "relative", width: '100%', textAlign: 'center' }} onClick={() => this.addThreshold()}> Add Threshhold</Button >
        <div style={{ height: "6px" }} />
        {this.props.value.map((value, index) => {
          return this.getThresholdView(value);
        })}
      </div >
    );

  }

  private getThresholdView(value: AlarmThreshold) {

    const iconRenderer: IconRenderer = new IconRenderer(value.iconId);

    return( 
      <div className="css-19chdzs" style={{ color: value.color, paddingRight: '4px'}}>

        <div className="css-1kn3rgh-input-wrapper">
          <div className="css-1w5c5dq-input-inputWrapper">
            <div className="css-13qljrm-input-prefix" >
              <div className="css-1ikfeb0" style={{ color: value.color }}>
                {iconRenderer.render()}
              </div>
            </div>
            <input className="css-1bjepp-input-input" type="text" value="Base" style={{ paddingLeft: '43px' }} />

            <div className="css-1glgcqu-input-suffix">
              <div className="css-1vzus6i-Icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="css-1ikfeb0" onClick={() => this.deleteThreshold(value) }>
                  <path d="M10,18a1,1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,10,18ZM20,6H16V5a3,3,0,0,0-3-3H11A3,3,0,0,0,8,5V6H4A1,1,0,0,0,4,8H5V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V8h1a1,1,0,0,0,0-2ZM10,5a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V6H10Zm7,14a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V8H17Zm-3-1a1,1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,14,18Z">
                  </path>
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>

    );
  }

  private addThreshold() {

    //console.log("addThreshold()");

    const alm: AlarmThreshold = { color: 'green', iconId: 2 };

    this.props.value.push(alm);

    this.setState({ dummy: '' });
  }

  private deleteThreshold(almThresh: AlarmThreshold) {

    //console.log("deleteThreshold(): " + almThresh.iconId + " " + almThresh.color);

    for (var i = 0; i < this.props.value.length; i++) {

      if (this.props.value[i] === almThresh) {
        this.props.value.splice(i, 1);
        i--;
      }
    }

    this.setState({ dummy: '' });

  }
}


