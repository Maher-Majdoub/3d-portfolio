import type { Object3D } from "three";
import type { IInteractable } from "../../interfaces/IInteractable";
import type IKeyboardListener from "../../interfaces/IKeyboardListener";
import renderingLoopManager from "../../managers/RenderingLoopManager";
import keyboardManager from "../../managers/KeyboardManager";
import { ComputerUIController } from "./ComputerUIController";

export class Computer implements IInteractable, IKeyboardListener {
  objects: Object3D[];

  private _uiController: ComputerUIController;

  constructor(objects: Object3D[]) {
    this.objects = objects;
    this._uiController = new ComputerUIController();

    keyboardManager.subscribe(this, ["KeyX"], false);
  }

  onKeyDown(keyCode: string): void {
    if (keyCode !== "KeyX")
      console.warn(`This class shouldn't listen to ${keyCode} events`);

    this.onExit();
  }

  onInteract(): void {
    this._uiController.mount();
    renderingLoopManager.stop();
  }

  onExit(): void {
    this._uiController.unmount();
    renderingLoopManager.start();
  }

  getPromptText = () => "Use Computer";
}
