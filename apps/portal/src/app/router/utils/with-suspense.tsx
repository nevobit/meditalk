import { Suspense, type JSX } from "react";

const withSuspense = (el: JSX.Element) => <Suspense fallback={null}> {el} </Suspense>;
export default withSuspense;
