import { Observable, Subject, timer } from "rxjs";
import { takeUntil, map, filter } from "rxjs/operators";
import { GamepadDetails } from "../types";
import { getGamepadNameAndInfo } from "../gamepad";

export class InputPoller {
  private stopPolling$ = new Subject();
  public inputs$: Observable<GamepadDetails[]>;

  public constructor(pollRateMs: number) {
    this.inputs$ = timer(0, pollRateMs).pipe(
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
  }

  public stop() {
    this.stopPolling$.next();
  }
}
