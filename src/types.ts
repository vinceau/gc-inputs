import { Vec2D } from "./utils";

export interface StickCardinals {
  center: Vec2D;
  left: number;
  right: number;
  up: number;
  down: number;
}

export type ButtonInfo =
  | null
  | { kind: "pressed"; index: number }
  | { kind: "value"; index: number; threshold: number }
  | { kind: "axis"; index: number; threshold: number };
export type StickInfo =
  | null
  | { kind: "axes"; xIndex: number; yIndex: number; cardinals: null | StickCardinals }
  | { kind: "value"; xIndex: number; yIndex: number; cardinals: null | StickCardinals };
export type TriggerInfo =
  | null
  | { kind: "axis"; index: number; min: number; max: number }
  | { kind: "value"; index: number; min: number; max: number }
  | { kind: "light"; index: number };
export type DPadInfo =
  | null
  | { kind: "buttons"; upIndex: number; downIndex: number; leftIndex: number; rightIndex: number }
  | { kind: "axis"; index: number }
  | { kind: "2axes"; xIndex: number; yIndex: number; xFlip: boolean; yFlip: boolean };

export type AllowedIDType = "Firefox" | "Chrome";

export interface GamepadID {
  name: string;
  id?: string;
  vendor?: string;
  product?: string;
  allowedIDType?: AllowedIDType;
}

export interface GamepadInfo {
  a: ButtonInfo;
  b: ButtonInfo;
  x: ButtonInfo;
  y: ButtonInfo;
  s: ButtonInfo;
  l: ButtonInfo;
  r: ButtonInfo;
  z: ButtonInfo;
  lA: TriggerInfo;
  rA: TriggerInfo;
  dpad: DPadInfo;
  ls: StickInfo;
  cs: StickInfo;
  isGC: boolean;
  ids: GamepadID[];
}

export interface GamepadDetails {
  name: string;
  info: GamepadInfo | null;
  gamepad: Gamepad;
}

export const nullGamepadInfo: GamepadInfo = {
  a: null,
  b: null,
  x: null,
  y: null,
  s: null,
  l: null,
  r: null,
  z: null,
  lA: null,
  rA: null,
  dpad: null,
  ls: null,
  cs: null,
  isGC: false,
  ids: [],
};
