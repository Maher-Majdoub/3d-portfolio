import type { IKeyboardListener } from "@interfaces";

class KeyboardManager {
  private _listeners: Map<
    IKeyboardListener,
    { downKeys: Set<string>; upKeys: Set<string> }
  > = new Map();

  private _pressedKeys: Set<string> = new Set();

  constructor() {
    window.addEventListener("keydown", this._notifyKeyDown);
    window.addEventListener("keyup", this._notifyKeyUp);
  }

  subscribe(
    listener: IKeyboardListener,
    interestedKeys: readonly string[],
    considerKeyUp: boolean
  ) {
    const keysSet = new Set(interestedKeys);
    this._listeners.set(listener, {
      downKeys: keysSet,
      upKeys: considerKeyUp ? keysSet : new Set(),
    });
  }

  unsubscribe(listener: IKeyboardListener) {
    this._listeners.delete(listener);
  }

  private _notifyKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.code;

    if (this._pressedKeys.has(keyCode)) return;
    this._pressedKeys.add(keyCode);

    this._listeners.forEach((keysObj, listener) => {
      if (keysObj.downKeys.has(keyCode)) listener.onKeyDown(keyCode);
    });
  };

  private _notifyKeyUp = (event: KeyboardEvent) => {
    const keyCode = event.code;
    this._pressedKeys.delete(keyCode);

    this._listeners.forEach((keysObj, listener) => {
      if (keysObj.upKeys.has(keyCode)) listener.onKeyUp?.(keyCode);
    });
  };
}

const keyboardManager = new KeyboardManager();
export { keyboardManager };
