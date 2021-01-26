import { PureComponent } from 'react';
import { FieldOverrideEditorProps, GrafanaTheme } from '@grafana/data';
import React from 'react';
import { Button, ColorPicker, FullWidthButtonContainer } from '@grafana/ui';
import { IconRenderer } from './IconRenderer';
import { AlarmThreshold, AlarmThresholdProps } from './types';
import { IconsPalette } from './IconsPalette';


interface State {
  selectedIconId: number | undefined
  showIconPopup: boolean
}

export class AlarmThresholdEditor extends PureComponent<FieldOverrideEditorProps<AlarmThresholdProps, any>, State> {

  constructor(props: Readonly<FieldOverrideEditorProps<AlarmThresholdProps, any>>) {
    super(props);
    this.state = {
      selectedIconId: undefined,
      showIconPopup: false
    };
  }


  render() {

    let almLims = (this.props.value as unknown as AlarmThreshold[]);

    return (

      <>
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

        </div>

      </>
    );

  }

  //renderPopup(alarmThreshold: AlarmThreshold) {

  //  //let iconPalette = IconsPalette({ id: 0, onChange: (id) => this.thresholdIconchanged(id), theme: {} as GrafanaTheme });


  //  if (alarmThreshold.iconId == this.state.selectedIconId) {

  //    //const r = createRef<any>();

  //    //<PopoverController content={iconPalette} hideAfter={300}>

  //    //  <Popover show={true} content={iconPalette} >
  //    //  </Popover>
  //    //</PopoverController>

  //    //return <div>

  //    //return <div >
  //    //    {iconPalette}
  //    //  </div>

  //    //</div>

  //      //<Popover show={true} content={iconPalette} referenceElement={r.current} >
  //      //</Popover>



  //  }

  //  return <></>;
  //}

  thresholdIconchanged(iconId: number): void {


    let almLims = (this.props.value as unknown as AlarmThreshold[]);

    var foundItem = almLims.filter(lim => lim.iconId === this.state.selectedIconId)[0];

    //console.log("thresholdIconchanged: current:" + foundItem.iconId + " new: "+ iconId);

    foundItem.iconId = iconId;

    this.setState({ selectedIconId: iconId, showIconPopup: false });
  }

  //private onIconChanged(newId: number) {

  //}

  private getThresholdView(alarmThreshold: AlarmThreshold, index: number) {

    //const iconRenderer: IconRenderer = new IconRenderer(alarmThreshold.iconId, this.changeThresholdIcon);
    const iconRenderer: IconRenderer = new IconRenderer(alarmThreshold.iconId, (id) => { });

    let iconPalette = IconsPalette({ id: 0, onChange: (id) => this.thresholdIconchanged(id), theme: {} as GrafanaTheme });

    //const alarmIcons: IconRenderer[] = [];

    //alarmIconIds.forEach((id, index, alarmIconIds) => {

    //  alarmIcons.push(new IconRenderer(id, this.changeThresholdIcon));
    //});

    //const alarmIcons: SelectableValue<string>[] = [SelectableValue{value:'34'}, '1231', '43412'];

    //const r = createRef<any>();

    //{ this.renderPopup(alarmThreshold) }

    return (

      <div>
        <div className="css-19chdzs" style={{ color: alarmThreshold.color, paddingRight: '4px'}}>

          <div className="css-1kn3rgh-input-wrapper">
            <div className="css-1w5c5dq-input-inputWrapper">
              <div className="css-13qljrm-input-prefix" >

                <div className="css-1ikfeb0" style={{ color: alarmThreshold.color }} onClick={() => this.changeThresholdIcon(alarmThreshold.iconId)}  >
                  {iconRenderer.render()}
                </div>

                <div style={{ paddingLeft: '6px' }}>
                  <ColorPicker
                    color={alarmThreshold.color}
                    onChange={color => this.onChangeThresholdColor(alarmThreshold, color)}
                    enableNamedColors={true}
                  />
                </div>
              </div>
              <input className="css-1bjepp-input-input" type="text" value={alarmThreshold.value} onChange={(event) => this.onChangeThresholdValue(alarmThreshold, event)} style={{ paddingLeft: '52px' }} />

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

        <div style={{ color: alarmThreshold.color, width: "0px" }} hidden={!(this.state.showIconPopup && (alarmThreshold.iconId == this.state.selectedIconId))} >
          {iconPalette}
        </div>

      </div>
    );
  }

    changeThresholdIcon(iconId: number) {
      console.log("changeThresholdIcon: " + iconId);
      this.setState({ selectedIconId: iconId, showIconPopup: !this.state.showIconPopup });
    }

  onChangeThresholdColor(alarmThreshold: AlarmThreshold, color: string): void {
    console.log("onChangeThresholdColor: " + color);

    alarmThreshold.color = color;
    this.forceUpdate();
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
          this.forceUpdate();

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

    this.forceUpdate();
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

    this.forceUpdate();
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


