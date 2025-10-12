import {
  AnimationMixer,
  type AnimationAction,
  type AnimationClip,
  type Object3D,
} from "three";
import type IUpdatable from "../interfaces/IUpdatable";
import renderingLoopManager from "./RenderingLoopManager";

export default class AnimationManager implements IUpdatable {
  private _mixer: AnimationMixer;
  private _actions: Record<string, AnimationAction | undefined> = {};
  private _currentAction: AnimationAction | null = null;
  private _fadeDuration: number;

  constructor(
    object: Object3D,
    animations: AnimationClip[],
    fadeDuration = 0.3
  ) {
    this._mixer = new AnimationMixer(object);

    animations.forEach((animation) => {
      this._actions[animation.name] = this._mixer.clipAction(animation);
    });

    this._fadeDuration = fadeDuration;

    renderingLoopManager.subscribe(this);
  }

  playAnimation(animationName: string) {
    const newAction = this._actions[animationName];

    if (!newAction) {
      console.warn(`[AnimationManager] Animation not found: ${animationName}`);
      return;
    }

    if (this._currentAction === newAction) return;

    this._currentAction?.fadeOut(this._fadeDuration);
    newAction.reset().fadeIn(this._fadeDuration).play();
    this._currentAction = newAction;
  }

  pause() {
    this._mixer.timeScale = 0;
  }

  resume() {
    this._mixer.timeScale = 1;
  }

  get currentAnimation(): string | null {
    return this._currentAction?.getClip().name ?? null;
  }

  dispose() {
    renderingLoopManager.unsubscribe(this);
    this._mixer.stopAllAction();
  }

  update(delta: number): void {
    this._mixer.update(delta);
  }
}
