import { KlineData } from "../../utils/types";
import { calculateVWAPSeriesData } from "../helper";

interface MidasParams {
  length1: number;
  length2: number;
  length3: number;
  length4: number;
}

export function calculateMidas(data: KlineData[], params: MidasParams) {
  const { length1, length2, length3, length4 } = params;

  function calculateMidasVwap(length: number, data: KlineData[]) {
    const vwapData = calculateVWAPSeriesData(data, data[0].time);
    return vwapData[vwapData.length - 1]?.value ?? null;
  }

  const result = data.map((_, i) => {
    const slice = data.slice(0, i + 1);

    const midas1 = calculateMidasVwap(length1, slice.slice(-length1));
    const midas2 = calculateMidasVwap(length2, slice.slice(-length2));
    const midas3 = calculateMidasVwap(length3, slice.slice(-length3));
    const midas4 = calculateMidasVwap(length4, slice.slice(-length4));

    return {
      time: data[i].time,
      midas1,
      midas2,
      midas3,
      midas4,
    };
  });

  return result;
}
