import { Clock } from "three";
import type { IUpdatable } from "@interfaces";

class RenderingLoopManager {
  private _clock: Clock;
  private _subscribers: Set<IUpdatable>;
  private _started: boolean;

  constructor() {
    this._clock = new Clock();
    this._subscribers = new Set();
    this._started = false;
  }

  subscribe(object: IUpdatable) {
    this._subscribers.add(object);
  }

  unsubscribe(object: IUpdatable) {
    this._subscribers.delete(object);
  }

  start() {
    if (this._started) return;
    this._started = true;
    this._clock.start();
    this._loop();
  }

  stop() {
    this._started = false;
  }

  private _loop = () => {
    if (!this._started) return;
    const delta = Math.min(this._clock.getDelta(), 0.1);

    this._subscribers.forEach((subscriber) => subscriber.update(delta));
    requestAnimationFrame(this._loop);
  };
}

const renderingLoopManager = new RenderingLoopManager();
export { renderingLoopManager };
