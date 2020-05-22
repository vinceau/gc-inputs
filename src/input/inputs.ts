import { deaden, scaleToMeleeAxes, scaleToGCTrigger } from "./melee";
import { GamepadInfo } from "../types";
import { stickValue, dPadState, buttonState, triggerValue } from "../gamepad";
import { Vec2D } from "../utils";

export const controllerResetCountdowns = [0, 0, 0, 0];

export interface Input {
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  z: boolean;
  l: boolean;
  r: boolean;
  s: boolean;
  du: boolean;
  dl: boolean;
  dr: boolean;
  dd: boolean;
  lA: number;
  rA: number;
  lsX: number;
  lsY: number;
  csX: number;
  csY: number;
  rawX: number;
  rawY: number;
  rawcsX: number;
  rawcsY: number;
}

type InputList = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  number,
  number,
  number,
  number,
  number,
  number
];

class InputData implements Input {
  a = false;
  b = false;
  x = false;
  y = false;
  z = false;
  r = false;
  l = false;
  s = false;
  du = false;
  dr = false;
  dd = false;
  dl = false;
  lsX = deaden(0);
  lsY = deaden(0);
  csX = deaden(0);
  csY = deaden(0);
  lA = 0;
  rA = 0;
  rawX = 0;
  rawY = 0;
  rawcsX = 0;
  rawcsY = 0;
}

export const nullInput = () => new InputData();

export const nullInputs = () => [
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
];
const aiPlayer1 = [
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
];
const aiPlayer2 = [
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
];
const aiPlayer3 = [
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
];

const aiPlayer4 = [
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
  new InputData(),
];

const aiInputBank = [aiPlayer1, aiPlayer2, aiPlayer3, aiPlayer4];

// should be able to move out the "frameByFrame" aspect of the following function
// it is only used to make z button mean "left trigger value = 0.35" + "A = true".
export const pollInputs = (
  gameMode: number,
  frameByFrame: boolean,
  controllerInfo: "keyboard" | GamepadInfo,
  playerSlot: number,
  controllerIndex: number,
  keys: { [key: number]: boolean },
  playertype: number
): Input => {
  // input is the input for player i in the current frame
  let input = nullInput(); // initialise with default values
  if (playertype === 1 && gameMode === 3) {
    return aiInputBank[playerSlot][0];
  } else if (controllerInfo === "keyboard") {
    // keyboard controls
    // do nothing
  } else if (playertype === 0) {
    input = pollGamepadInputs(gameMode, controllerInfo, playerSlot, controllerIndex, frameByFrame);
  }
  console.log("got these inputs");
  console.log(input);
  return input;
};

export const mapGamepadToInput = (gamepad: Gamepad, gamepadInfo: GamepadInfo): Input => {
  const playerSlot = 0;
  // const gameMode = 1;
  const frameByFrame = false;

  const input = nullInput();
  // -------------------------------------------------------
  // analog sticks

  const lsVec = stickValue(gamepad, gamepadInfo, "ls");
  const csVec = stickValue(gamepad, gamepadInfo, "cs");
  const isGC = gamepadInfo.isGC;

  let lsCardinals = null;
  if (gamepadInfo.ls !== null) {
    lsCardinals = gamepadInfo.ls.cardinals;
  }
  let csCardinals = null;
  if (gamepadInfo.cs !== null) {
    csCardinals = gamepadInfo.cs.cardinals;
  }

  const lsticks = scaleToMeleeAxes(
    lsVec.x, // x-axis data
    lsVec.y, // y-axis data
    isGC,
    lsCardinals,
    custcent[playerSlot].ls.x, // x-axis "custom center" offset
    custcent[playerSlot].ls.y // y-axis "custom center" offset
  );
  const csticks = scaleToMeleeAxes(
    csVec.x,
    csVec.y,
    isGC,
    csCardinals,
    custcent[playerSlot].cs.x,
    custcent[playerSlot].cs.y
  );
  input.lsX = deaden(lsticks[0]);
  input.lsY = deaden(lsticks[1]);
  input.csX = deaden(csticks[0]);
  input.csY = deaden(csticks[1]);
  input.rawX = lsticks[0];
  input.rawY = lsticks[1];
  input.rawcsX = csticks[0];
  input.rawcsY = csticks[1];

  // -------------------------------------------------------
  // buttons

  input.s = buttonState(gamepad, gamepadInfo, "s");
  input.x = buttonState(gamepad, gamepadInfo, "x");
  input.a = buttonState(gamepad, gamepadInfo, "a");
  input.b = buttonState(gamepad, gamepadInfo, "b");
  input.y = buttonState(gamepad, gamepadInfo, "y");
  input.z = buttonState(gamepad, gamepadInfo, "z");

  // -------------------------------------------------------
  // triggers

  input.l = buttonState(gamepad, gamepadInfo, "l");
  input.r = buttonState(gamepad, gamepadInfo, "r");

  if (gamepadInfo.lA !== null) {
    const lA = gamepadInfo.lA;
    if (lA.kind === "light") {
      input.lA = triggerValue(gamepad, gamepadInfo, "lA");
    } else {
      input.lA = scaleToGCTrigger(
        triggerValue(gamepad, gamepadInfo, "lA"), // raw trigger value
        -lA.min - custcent[playerSlot].l, // offset
        lA.max - lA.min // scaling
      );
    }
  }

  if (gamepadInfo.rA !== null) {
    const rA = gamepadInfo.rA;
    if (rA.kind === "light") {
      input.rA = triggerValue(gamepad, gamepadInfo, "rA");
    } else {
      input.rA = scaleToGCTrigger(
        triggerValue(gamepad, gamepadInfo, "rA"), // raw trigger value
        -rA.min - custcent[playerSlot].r, // offset
        rA.max - rA.min // scaling
      );
    }
  }

  if (controllerResetCountdowns[playerSlot] === 0) {
    setCustomCenters(playerSlot, lsVec, csVec, input.lA, input.rA);
  }

  if (!frameByFrame /* && gameMode !== 4 && gameMode !== 14*/) {
    // not in target builder or calibration screen
    if (input.z) {
      if (input.lA < 0.35) {
        input.lA = 0.35;
      }
      input.a = true;
    }
  }

  /*
  if (gameMode !== 14) {
    if (input.l) {
      input.lA = 1;
    }
    if (input.r) {
      input.rA = 1;
    }

    if (input.lA > 0.95) {
      input.l = true;
    }
    if (input.rA > 0.95) {
      input.r = true;
    }
  }
  */

  // -------------------------------------------------------
  // d-pad

  const dPadData = dPadState(gamepad, gamepadInfo);
  input.dl = dPadData.left;
  input.dd = dPadData.down;
  input.dr = dPadData.right;
  input.du = dPadData.up;

  return input;
};

const pollGamepadInputs = (
  gameMode: number,
  gamepadInfo: GamepadInfo,
  playerSlot: number,
  controllerIndex: number,
  frameByFrame: boolean
): Input => {
  const input = nullInput();

  if (navigator.getGamepads === undefined) {
    return input;
  }
  const gamepads = navigator.getGamepads();
  const gamepad = gamepads[controllerIndex];
  if (gamepad === null || gamepad === undefined) {
    return input;
  }

  // -------------------------------------------------------
  // analog sticks

  const lsVec = stickValue(gamepad, gamepadInfo, "ls");
  const csVec = stickValue(gamepad, gamepadInfo, "cs");
  const isGC = gamepadInfo.isGC;

  let lsCardinals = null;
  if (gamepadInfo.ls !== null) {
    lsCardinals = gamepadInfo.ls.cardinals;
  }
  let csCardinals = null;
  if (gamepadInfo.cs !== null) {
    csCardinals = gamepadInfo.cs.cardinals;
  }

  const lsticks = scaleToMeleeAxes(
    lsVec.x, // x-axis data
    lsVec.y, // y-axis data
    isGC,
    lsCardinals,
    custcent[playerSlot].ls.x, // x-axis "custom center" offset
    custcent[playerSlot].ls.y // y-axis "custom center" offset
  );
  const csticks = scaleToMeleeAxes(
    csVec.x,
    csVec.y,
    isGC,
    csCardinals,
    custcent[playerSlot].cs.x,
    custcent[playerSlot].cs.y
  );
  input.lsX = deaden(lsticks[0]);
  input.lsY = deaden(lsticks[1]);
  input.csX = deaden(csticks[0]);
  input.csY = deaden(csticks[1]);
  input.rawX = lsticks[0];
  input.rawY = lsticks[1];
  input.rawcsX = csticks[0];
  input.rawcsY = csticks[1];

  // -------------------------------------------------------
  // buttons

  input.s = buttonState(gamepad, gamepadInfo, "s");
  input.x = buttonState(gamepad, gamepadInfo, "x");
  input.a = buttonState(gamepad, gamepadInfo, "a");
  input.b = buttonState(gamepad, gamepadInfo, "b");
  input.y = buttonState(gamepad, gamepadInfo, "y");
  input.z = buttonState(gamepad, gamepadInfo, "z");

  // -------------------------------------------------------
  // triggers

  input.l = buttonState(gamepad, gamepadInfo, "l");
  input.r = buttonState(gamepad, gamepadInfo, "r");

  if (gamepadInfo.lA !== null) {
    const lA = gamepadInfo.lA;
    if (lA.kind === "light") {
      input.lA = triggerValue(gamepad, gamepadInfo, "lA");
    } else {
      input.lA = scaleToGCTrigger(
        triggerValue(gamepad, gamepadInfo, "lA"), // raw trigger value
        -lA.min - custcent[playerSlot].l, // offset
        lA.max - lA.min // scaling
      );
    }
  }

  if (gamepadInfo.rA !== null) {
    const rA = gamepadInfo.rA;
    if (rA.kind === "light") {
      input.rA = triggerValue(gamepad, gamepadInfo, "rA");
    } else {
      input.rA = scaleToGCTrigger(
        triggerValue(gamepad, gamepadInfo, "rA"), // raw trigger value
        -rA.min - custcent[playerSlot].r, // offset
        rA.max - rA.min // scaling
      );
    }
  }

  if (controllerResetCountdowns[playerSlot] === 0) {
    setCustomCenters(playerSlot, lsVec, csVec, input.lA, input.rA);
  }

  if (!frameByFrame && gameMode !== 4 && gameMode !== 14) {
    // not in target builder or calibration screen
    if (input.z) {
      if (input.lA < 0.35) {
        input.lA = 0.35;
      }
      input.a = true;
    }
  }

  if (gameMode !== 14) {
    if (input.l) {
      input.lA = 1;
    }
    if (input.r) {
      input.rA = 1;
    }

    if (input.lA > 0.95) {
      input.l = true;
    }
    if (input.rA > 0.95) {
      input.r = true;
    }
  }

  // -------------------------------------------------------
  // d-pad

  const dPadData = dPadState(gamepad, gamepadInfo);
  input.dl = dPadData.left;
  input.dd = dPadData.down;
  input.dr = dPadData.right;
  input.du = dPadData.up;

  return input;
};

class CustomCenters {
  ls = new Vec2D(0, 0);
  cs = new Vec2D(0, 0);
  l = 0;
  r = 0;
}

const custcent = [new CustomCenters(), new CustomCenters(), new CustomCenters(), new CustomCenters()];

const setCustomCenters = (i: number, ls0: Vec2D, cs0: Vec2D, l0: number, r0: number): void => {
  custcent[i].ls = ls0;
  custcent[i].cs = cs0;
  custcent[i].l = l0;
  custcent[i].r = r0;
};
