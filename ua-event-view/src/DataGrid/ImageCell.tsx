import { getTextColorForBackground } from '@grafana/ui';
import React, { FC } from 'react';
import { TableCellProps } from './types';

export const ImageCell: FC<TableCellProps> = props => {
  const { field, cell, tableStyles, cellProps } = props;

  const dataValue = field.values.get(cell.row.index);
  const displayValue = field.display!(cell.value);
  const text = displayValue?.text;

  let iconColor = 'white';

  let valueAsFloat = parseFloat(dataValue);
  if (valueAsFloat != undefined) { 

    let stepSorted = field.config.thresholds?.steps.sort(s => s.value);

    for (let i = 0; stepSorted != undefined && i < stepSorted?.length; i++) {
      let step = field.config.thresholds?.steps[i];
      if (step != undefined && valueAsFloat > step.value) {
        iconColor = step.color;
      }
    }
  }

  const textColor = getTextColorForBackground(cellProps.backgroundColor?.toString() ?? "black");

  //console.log("ImageCell: " + text + "  " + iconColor);

  let { translate, ...restProps } = { ...cellProps };


  //<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="css-sr6nr">
  //  <g id="Layer_2" data-name="Layer 2">
  //    <g id="Layer_1-2" data-name="Layer 1">
  //      <path d="M18.17,1.85h0A6.25,6.25,0,0,0,12.12.23L9.42,6.56l2.83.71a1,1,0,0,1,.67,1.41l-2,4a1,1,0,0,1-.9.56,1.13,1.13,0,0,1-.44-.1h0a1,1,0,0,1-.46-1.33l1.4-2.89-2.77-.7a1,1,0,0,1-.65-.53,1,1,0,0,1,0-.83L9.58,1a6.27,6.27,0,0,0-7.73,9.77L9.3,18.18a1,1,0,0,0,1.42,0h0l7.45-7.46A6.27,6.27,0,0,0,18.17,1.85Z">
  //      </path>
  //    </g>
  //  </g>
  //</svg>

        //  <div style={{ color: iconColor, paddingRight: '4px' }}>
        //  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16" >
        //    <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5zm2.5 5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5zM.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z" />
        //  </svg>
        //</div>

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //    <path d="M9.97 4.88l.953 3.811C10.158 8.878 9.14 9 8 9c-1.14 0-2.159-.122-2.923-.309L6.03 4.88C6.635 4.957 7.3 5 8 5s1.365-.043 1.97-.12zm-.245-.978L8.97.88C8.718-.13 7.282-.13 7.03.88L6.274 3.9C6.8 3.965 7.382 4 8 4c.618 0 1.2-.036 1.725-.098zm4.396 8.613a.5.5 0 0 1 .037.96l-6 2a.5.5 0 0 1-.316 0l-6-2a.5.5 0 0 1 .037-.96l2.391-.598.565-2.257c.862.212 1.964.339 3.165.339s2.303-.127 3.165-.339l.565 2.257 2.391.598z" />
        //  </svg>
        //</div>

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        //  </svg>
        //</div>

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor"  viewBox="0 0 16 16">
        //    <path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098L9.05.435zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        //  </svg>
        //</div>

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        //</svg>
        //</div>

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        //  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm-1.146 6.854l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-11zm-1 .724c-2.067.95-4.539 1.481-7 1.656v6.237a25.222 25.222 0 0 1 1.088.085c2.053.204 4.038.668 5.912 1.56V3.224zm-8 7.841V4.934c-.68.027-1.399.043-2.008.053A2.02 2.02 0 0 0 0 7v2c0 1.106.896 1.996 1.994 2.009a68.14 68.14 0 0 1 .496.008 64 64 0 0 1 1.51.048zm1.39 1.081c.285.021.569.047.85.078l.253 1.69a1 1 0 0 1-.983 1.187h-.548a1 1 0 0 1-.916-.599l-1.314-2.48a65.81 65.81 0 0 1 1.692.064c.327.017.65.037.966.06z" />
        //</svg>
        //</div >

        //<div style={{ color: iconColor, paddingRight: '4px' }}>
        //<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
        //  <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        //</svg>
        //</div >


  return (

    <div {...restProps} className={tableStyles.cellContainer}>



        <div style={{ color: iconColor, paddingRight: '4px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"  fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
          </svg>
        </div >

        <div style={{ color: textColor }}>
          {text}
        </div>

    </div>
  );
};
