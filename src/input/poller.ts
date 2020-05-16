import { Observable, Subject, timer } from "rxjs";
import { takeUntil, map, filter } from "rxjs/operators";

export class InputPoller {
  private stopPolling$ = new Subject();
  public inputs$: Observable<Gamepad[]>;

  public constructor(pollRateMs: number) {
    this.inputs$ = timer(0, pollRateMs).pipe(
      takeUntil(this.stopPolling$),
      map((): Gamepad[] => {
        const gamepads = navigator.getGamepads
          ? navigator.getGamepads()
          : navigator.webkitGetGamepads
          ? navigator.webkitGetGamepads()
          : [];
        return gamepads;
      }),
      filter((gamepads) => gamepads.length > 0)
    );
  }

  public stop() {
    this.stopPolling$.next();
  }
}
