import React from "react";

import { ControllerLayout, ControllerInputState } from "react-gamecube";
import { InputPoller, Input } from "gc-inputs";
import { map, filter } from "rxjs/operators";
import { Observable } from "rxjs";

const poller = new InputPoller(50);
const mapInputToController = (info: Input): Partial<ControllerInputState> => {
  return {
    a: info.a,
    b: info.b,
    x: info.x,
    y: info.y,
    dd: info.dd,
    dl: info.dl,
    dr: info.dr,
    du: info.du,
    start: info.s,
    l: info.l,
    r: info.r,
    z: info.z,
    lValue: info.lA,
    rValue: info.rA,
    cStickX: info.csX,
    cStickY: info.csY,
    controlX: info.lsX,
    controlY: info.lsY,
  };
}

export default {
  title: "ControllerLayout",
};

export const App = () => {
  const [inputs, setInputs] = React.useState<Input[]>([]);
  const [port, setPort] = React.useState<number>(1);

  React.useLayoutEffect(() => {
    poller.allInputs$.subscribe((pads) => {
      setInputs(pads);
    });
  }, []);

  const value = inputs.length >= port ? mapInputToController(inputs[port - 1]) : undefined;

  return (
    <div>
      <div>Current port: {port}</div>
      <button onClick={() => setPort(1)}>Port 1</button>
      <button onClick={() => setPort(2)}>Port 2</button>
      <button onClick={() => setPort(3)}>Port 3</button>
      <button onClick={() => setPort(4)}>Port 4</button>
      <ControllerLayout value={value} />
      <pre>{JSON.stringify(value, undefined, 2)}</pre>
    </div>
  );
}
