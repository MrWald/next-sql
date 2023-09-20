"use client"
import styles from './page.module.css'

import dynamic from "next/dynamic";

const PivotWrapper = dynamic(() => import("@/app/PivotWrapper"), {
  ssr: false,
  loading: () => <p>Loading Flexmonster...</p>
});

import * as React from "react"; 
import { Pivot } from "react-flexmonster";

const ForwardRefPivot = React.forwardRef<Pivot, Flexmonster.Params>(
  (props, ref?: React.ForwardedRef<Pivot>) => <PivotWrapper {...props} pivotRef={ref}/>
)


export default function Home() {
  const pivotRef: React.RefObject<Pivot> = React.useRef<Pivot>(null);
  return (
    <main className={styles.main}>
      <ForwardRefPivot
        ref={pivotRef}
        toolbar={true}
      />
    </main>
  )
}
