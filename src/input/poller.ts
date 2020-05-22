import { Observable, Subject, timer } from "rxjs";
import { takeUntil, map, filter } from "rxjs/operators";
import { GamepadDetails } from "../types";
import { getGamepadNameAndInfo } from "../gamepad";
import { Input, mapGamepadToInput } from "./inputs";

declare global {
  interface Navigator {
    webkitGetGamepads: () => Gamepad[];
  }
}

export class InputPoller {
  private stopPolling$ = new Subject();
  public rawInputs$: Observable<GamepadDetails[]>;
  public allInputs$: Observable<Input[]>;

  public constructor(pollRateMs: number) {
    this.rawInputs$ = timer(0, pollRateMs).pipe(
      // Get gamepad inputs
      map((): Gamepad[] => {
        const gamepads = navigator.getGamepads
          ? navigator.getGamepads()
          : navigator.webkitGetGamepads
          ? navigator.webkitGetGamepads()
          : [];
        return gamepads;
      }),
      // Filter out empty invalid gamepads
      filter((gamepads) => gamepads.length > 0),
      map((gamepads) => {
        return gamepads.map((pad) => {
          const maybeNameAndInfo = getGamepadNameAndInfo(pad.id);
          return {
            ...maybeNameAndInfo,
            gamepad: pad,
          };
        });
      }),
      // Stop when we're told
      takeUntil(this.stopPolling$)
    );

    this.allInputs$ = this.rawInputs$.pipe(
      map((details) => {
        return details.map((gpDetails) => {
          return mapGamepadToInput(gpDetails.gamepad, gpDetails.info);
        });
      })
    );
  }

  public portInputs(port: number): Observable<Input> {
    return this.allInputs$.pipe(
      filter((details) => details.length >= port),
      map((details) => {
        return details[port - 1];
      })
    );
  }

  public stop() {
    this.stopPolling$.next();
  }
}
