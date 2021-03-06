// ----------------------------------------------------------------------------------------------------
// Melee input simulation

import { StickCardinals } from "../types";
import { inverseMatrix, multMatVect } from "../utils";

type NumberPair = [number, number];

const fromCardinals = (centers: NumberPair, l: number, r: number, d: number, u: number) => {
  const [origx, origy] = centers;
  return [
    [origx, origy],
    [l, origy],
    [r, origy],
    [origx, d],
    [origx, u],
  ];
};

// parameters for GC controller simulation
// the following function gives an approximation to the extreme raw axis data for a given controller
// of course, this varies between controllers, but this serves as a useful first approximation
// function output: [[origx, origy], [lx, ly], [rx, ry], [dx, dy], [ux, uy]]
const stickExtremePoints = (stickCardinals: StickCardinals | null): any => {
  if (stickCardinals === null || stickCardinals === undefined) {
    return fromCardinals([0, 0], -1, 1, 1, -1);
  } else {
    return fromCardinals(
      [stickCardinals.center.x, stickCardinals.center.y],
      stickCardinals.left,
      stickCardinals.right,
      stickCardinals.down,
      stickCardinals.up
    );
  }
};

// The following function renormalises axis input,
// so that corners (l = left, r = right, d=down, u=up) are mapped to the respective corners of the unit square.
// This function assumes that ALL coordinates have already been centered.
// Return type: [xnew,ynew]
const renormaliseAxisInput = (
  [lx, ly]: NumberPair,
  [rx, ry]: NumberPair,
  [dx, dy]: NumberPair,
  [ux, uy]: NumberPair,
  [x, y]: NumberPair
): NumberPair => {
  let invMat;
  if (x * ry - y * rx <= 0 && x * uy - y * ux >= 0) {
    // quadrant 1
    invMat = inverseMatrix([
      [rx, ux],
      [ry, uy],
    ]);
  } else if (x * uy - y * ux <= 0 && x * ly - y * lx >= 0) {
    // quadrant 2
    invMat = inverseMatrix([
      [-lx, ux],
      [-ly, uy],
    ]);
  } else if (x * ly - y * lx <= 0 && x * dy - y * dx >= 0) {
    // quadrant 3
    invMat = inverseMatrix([
      [-lx, -dx],
      [-ly, -dy],
    ]);
  } else {
    // quadrant 4
    invMat = inverseMatrix([
      [rx, -dx],
      [ry, -dy],
    ]);
  }

  if (invMat === null || invMat === undefined) {
    return [x, y];
  } else {
    return multMatVect(invMat, [x, y]);
  }
};

// clamps a value between -1 and 1
const toInterval = (x: number): number => {
  if (x < -1) {
    return -1;
  } else if (x > 1) {
    return 1;
  } else {
    return x;
  }
};

// Analog triggers.

// t = trigger input
export const scaleToGCTrigger = (t: number, offset: number, scale: number): number => {
  const tnew = Math.abs(scale) < 0.001 ? 0 : (t + offset) / scale;
  if (tnew > 1) {
    return 1;
  } else if (tnew < 0.3) {
    return 0;
  } else {
    return tnew;
  }
};

// ---------------------------
// GC controller simulation

const steps = 80;
const deadzoneConst = 0.28;
const leniency = 10;

const meleeOrig = 128;
const meleeMin = meleeOrig - (steps + leniency); // lowest  0 -- 255 input the controller will give
const meleeMax = meleeOrig + (steps + leniency); // highest 0 -- 255 input the controller will give

// rescales -1 -- 0 -- 1 to min -- orig -- max, and rounds to nearest integer
const discretise = (x: number, min: number, orig: number, max: number): number => {
  if (x < 0) {
    return Math.round(x * (orig - min) + orig);
  } else if (x > 0) {
    return Math.round(x * (max - orig) + orig);
  } else {
    return orig;
  }
};

// Rescales controller input to -1 -- 0 -- 1 in both axes
export const scaleToUnitAxes = (
  x: number,
  y: number,
  stickCardinals: null | StickCardinals,
  customCenterX: number,
  customCenterY: number
): NumberPair => {
  let [[origx, origy], [lx, ly], [rx, ry], [dx, dy], [ux, uy]] = stickExtremePoints(stickCardinals);
  origx += customCenterX;
  origy += customCenterY;
  const [xnew, ynew] = renormaliseAxisInput(
    [lx - origx, ly - origy],
    [rx - origx, ry - origy],
    [dx - origx, dy - origy],
    [ux - origx, uy - origy],
    [x - origx, y - origy]
  );
  return [toInterval(xnew), toInterval(ynew)];
};

// Rescales -1 -- 1 input to 0 -- 255 values to simulate a GC controller
const scaleUnitToGCAxes = (x: number, y: number): NumberPair => {
  const xnew = discretise(x, meleeMin, meleeOrig, meleeMax);
  const ynew = discretise(y, meleeMin, meleeOrig, meleeMax);
  return [xnew, ynew];
};

// Rescales controller input to 0 -- 255 values to simulate a GC controller
const scaleToGCAxes = (
  x: number,
  y: number,
  stickCardinals: null | StickCardinals,
  customCenterX: number,
  customCenterY: number
): NumberPair => {
  const [xnew, ynew] = scaleToUnitAxes(x, y, stickCardinals, customCenterX, customCenterY);
  return scaleUnitToGCAxes(xnew, ynew);
};

// ---------------------------------
// Melee input rescaling functions

// basic mapping from 0 -- 255 back to -1 -- 1 done by Melee
const axisRescale = (x: number, orig: number = meleeOrig) => {
  return (x - orig) / steps;
};

const unitRetract = ([x, y]: NumberPair): NumberPair => {
  const norm = Math.sqrt(x * x + y * y);
  if (norm < 1) {
    return [x, y];
  } else {
    return [x / norm, y / norm];
  }
};

export const meleeRound = (x: number): number => {
  return Math.round(steps * x) / steps;
};

const meleeAxesRescale = ([x, y]: NumberPair): NumberPair => {
  const xnew = axisRescale(x, meleeOrig);
  const ynew = axisRescale(y, meleeOrig);
  let [xnew2, ynew2] = unitRetract([xnew, ynew]);
  return [meleeRound(xnew2), meleeRound(ynew2)];
};

// this is the main input rescaling function
// it scales raw input data to the data Melee uses for the simulation
// number : controller ID, to rescale axes dependent on controller raw input
// bool == false means no deadzone, bool == true means deadzone
export const scaleToMeleeAxes = (
  x: number,
  y: number,
  isGC: boolean,
  stickCardinals: null | StickCardinals,
  customCenterX: number = 0,
  customCenterY: number = 0
): NumberPair => {
  let xnew = x;
  let ynew = y;
  if (isGC) {
    // gamecube controllers, don't mess up the raw data
    xnew = ((x - customCenterX + 1) * 255) / 2; // convert raw input to 0 -- 255 values in obvious way
    ynew = ((-y + customCenterY + 1) * 255) / 2; // y incurs a sign flip
    //console.log("You are using raw GC controller data.");
  } else {
    // convert raw input to 0 -- 255 by GC controller simulation
    [xnew, ynew] = scaleToGCAxes(x, y, stickCardinals, customCenterX, customCenterY);
    //console.log("You are using GC controller simulation.");
  }
  return meleeAxesRescale([xnew, ynew]);
};

export const deaden = (x: number, dead: number = deadzoneConst): number => {
  return Math.abs(x) < dead ? 0 : x;
};

// scales -1 -- 1 TAS data to the data Melee uses for the simulation
export const tasRescale = (x: number, y: number, isDeadzoned = false): NumberPair => {
  const xnew = ((x + 1) * 255) / 2;
  const ynew = ((y + 1) * 255) / 2;
  return meleeAxesRescale([xnew, ynew] /*, isDeadzoned */);
};
