import { NumberFormatOptions } from '../types';

export function formatValue(val: any, decimalPoints: number, formatOptions: NumberFormatOptions): any {
  if (formatOptions === NumberFormatOptions.None)
    return val;
  if (Number.isFinite(val) && decimalPoints >= 0) {
    let n: number = val;
    if (formatOptions === NumberFormatOptions.Precision)
      return n.toPrecision(decimalPoints);
    if (formatOptions === NumberFormatOptions.Fixed)
      return n.toFixed(decimalPoints);
    if (formatOptions === NumberFormatOptions.Exponential)
      return n.toExponential(decimalPoints);
    if (formatOptions === NumberFormatOptions.LocaleString)
      return n.toLocaleString();
  }
  return val;
}


export function toFormatOptions(formatOptions: string): NumberFormatOptions {
  if (formatOptions === "None")
    return NumberFormatOptions.None;
  if (formatOptions === "Precision")
    return NumberFormatOptions.Precision;
  if (formatOptions === "Fixed")
    return NumberFormatOptions.Fixed;
  if (formatOptions === "Exponential")
    return NumberFormatOptions.Exponential;
  if (formatOptions === "LocaleString")
    return NumberFormatOptions.LocaleString;
  return NumberFormatOptions.None;
}
