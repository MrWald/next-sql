"use client"
import styles from "./page.module.css";

// Flexmonster
import dynamic from "next/dynamic";

const PivotWrapper = dynamic(() => import("@/app/PivotWrapper"), {
  ssr: false,
  loading: () => <p>Loading Flexmonster...</p>
});

import * as React from "react"; 
import { Pivot } from "react-flexmonster";

const ForwardRefPivot = React.forwardRef<Pivot, Flexmonster.Params>(
  (props, ref?: React.ForwardedRef<Pivot>) => <PivotWrapper {...props} pivotRef={ref}/>
);

const report = {
  dataSource: {
    type: "api",
    url: "http://localhost:9500",
    index: "next-sql"
  }
};

// Recharts
import { LineChart, Line, CartesianGrid, YAxis, XAxis } from "recharts";

interface RechartsDataObject { [key: string]: any; }
interface RechartsData {
  data: RechartsDataObject[];
  xName: string;
  lineName: string;
}

// Flexmonster + Recharts
import { GetDataValueObject } from "flexmonster";

function prepareDataFunction(rawData : Flexmonster.GetDataValueObject) : RechartsData | null {
  // If there is no data, return null
  if(!rawData.data.length)
    return null;
  // Initialize chartsData object
  const chartsData: RechartsData = {
    data: [],
    xName: rawData.meta["r0Name" as keyof typeof rawData.meta],
    lineName: rawData.meta["v0Name" as keyof typeof rawData.meta]
  };
  // Transform Flexmonster data so it can be processed by Recharts
  // The first rawData element is skipped because it contains a grand total value, not needed for our charts
  for(let i=1, dataObj, chartDataObj: RechartsDataObject; i < rawData.data.length; i++) {
    dataObj = rawData.data[i];
    chartDataObj = {};
    chartDataObj[chartsData.xName] = dataObj["r0" as keyof typeof dataObj];
    chartDataObj[chartsData.lineName] = dataObj["v0" as keyof typeof dataObj];;
    chartsData.data.push(chartDataObj);
  }
  return chartsData;
}

export default function Home() {
  // Flexmonster instance ref
  const pivotRef: React.RefObject<Pivot> = React.useRef<Pivot>(null);

  // Recharts data
  const [chartsData, setChartsData] = React.useState<RechartsData>({data: [], xName: "", lineName: ""});

  // Subscribe on Recharts data changes
  React.useEffect(() => {
    console.log("Charts data changed!");
  }, [chartsData]);

  // Function for chart drawing
  const drawChart = (rawData: GetDataValueObject) => {
    const chartsData = prepareDataFunction(rawData);
    if(chartsData) {
      setChartsData(chartsData);
    }
  }

  return (
    <main className={styles.main}>
      <ForwardRefPivot
        ref={pivotRef}
        toolbar={true}
        // Setting report
        report={report}
        // Connecting Flexmonster and Recharts
        reportcomplete={() => {
          pivotRef.current?.flexmonster.off("reportcomplete");
          pivotRef.current?.flexmonster.getData(
            {},
            drawChart,
            drawChart
          );
        }}
        licenseFilePath="https://cdn.flexmonster.com/jsfiddle.charts.key"
      />
      <LineChart width={1000} height={300} data={chartsData.data}>
        <Line dataKey={chartsData.lineName} type="monotone" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey={chartsData.xName} />
        <YAxis />
      </LineChart>
    </main>
  );
}
