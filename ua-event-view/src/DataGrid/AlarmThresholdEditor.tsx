import { PureComponent } from 'react';
import { FieldOverrideEditorProps } from '@grafana/data';
import React from 'react';
import { Button, FullWidthButtonContainer } from '@grafana/ui';
import { IconRenderer } from './IconRenderer';
import { AlarmThreshold, AlarmThresholdProps } from './types';


interface State {
  dummy: string | null,
}

export class AlarmThresholdEditor extends PureComponent<FieldOverrideEditorProps<AlarmThresholdProps, any>, State> {

  constructor(props: Readonly<FieldOverrideEditorProps<AlarmThresholdProps, any>>) {
    super(props);
    this.state = { dummy: '1'};
  }

  render() {

    let almLims = (this.props.value as unknown as AlarmThreshold[]);

    return (

      <div style={{ position: "relative", width: '100%' }} >

        <FullWidthButtonContainer>
          <Button size="sm" icon="plus" onClick={() => this.addThreshold()} variant="secondary">
            Add threshold
          </Button>
        </FullWidthButtonContainer>

        <div style={{ height: "6px" }} />
        {almLims.map((value, index) => {
          return this.getThresholdView(value, index);
        })}
      </div >
    );

  }

  private getThresholdView(alarmThreshold: AlarmThreshold, index: number) {

    const iconRenderer: IconRenderer = new IconRenderer(alarmThreshold.iconId);

    return( 
      <div className="css-19chdzs" style={{ color: alarmThreshold.color, paddingRight: '4px'}}>

        <div className="css-1kn3rgh-input-wrapper">
          <div className="css-1w5c5dq-input-inputWrapper">
            <div className="css-13qljrm-input-prefix" >
              <div className="css-1ikfeb0" style={{ color: alarmThreshold.color }}>
                {iconRenderer.render()}
              </div>
            </div>
            <input className="css-1bjepp-input-input" type="text" value={alarmThreshold.value} onChange={(event) => this.onChangeThresholdValue(alarmThreshold, event)} style={{ paddingLeft: '43px' }} />

            <div className="css-1glgcqu-input-suffix">
              <div className="css-1vzus6i-Icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="css-1ikfeb0" onClick={() => this.deleteThreshold(alarmThreshold) }>
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

  private onChangeThresholdValue(almThresh: AlarmThreshold, event: React.ChangeEvent<HTMLInputElement>) {

    let numeric = this.isNumeric(event.target.value);

    //console.log("onChangeThresholdValue: " + numeric + "   " + event.target.value + "  " + almThresh.iconId + "  " + almThresh.value);

    if (numeric) {

      let value = event.target.value;
      value = value.length === 0 ? '0' : value;

      let almLims = (this.props.value as unknown as AlarmThreshold[]);

      for (let i = 0; i < almLims.length; i++) {

        if (almLims[i] === almThresh) {
          almLims[i].value = parseFloat(value);
          this.setState({ dummy: (new Date()).getTime().toString() });
          break;
        }
      }
    }

  }

  private addThreshold() {

    //console.log("addThreshold()");

    const alm: AlarmThreshold = { color: 'green', iconId: 0, value: 0 };

    let almLims = (this.props.value as unknown as AlarmThreshold[]);

    almLims.unshift(alm);

    this.setState({ dummy: (new Date()).getTime().toString() });
  }

  private deleteThreshold(almThresh: AlarmThreshold) {

    //console.log("deleteThreshold(): " + almThresh.iconId + " " + almThresh.color);

    let almLims = (this.props.value as unknown as AlarmThreshold[]);


    for (var i = 0; i < almLims.length; i++) {

      if (almLims[i] === almThresh) {
        almLims.splice(i, 1);
        i--;
      }
    }

    this.setState({ dummy: (new Date()).getTime().toString() });
  }

  private isNumeric(str: React.ReactText) {

    let value = str.toString();

    if (value.length === 0)
      return true;

    let trimmed: string = '';

    if (value.length > 1) {

      for (let i = 0; i < value.length; i++) {
        if (value[i] != '0')
          trimmed += value[i];
      }
    }
    else
      trimmed = value;

    //console.log("parseFloat(str.toString()): " + trimmed + "  " + parseFloat(trimmed));
    return !isNaN(parseFloat(trimmed));
  }
}


