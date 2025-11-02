import type { Object3D } from "three";
import type { IInteractable } from "../../interfaces/IInteractable";
import renderingLoopManager from "../../managers/RenderingLoopManager";
import computerPageHtml from "./computer.html?raw";

export class Computer implements IInteractable {
  objects: Object3D[];

  private _computerPageElement: HTMLElement;

  constructor(objects: Object3D[]) {
    this.objects = objects;
    this._computerPageElement = this._createComputerPage();
  }

  onInteract(): void {
    document.body.appendChild(this._computerPageElement);
    renderingLoopManager.stop();
  }

  getPromptText = () => "Use Computer";

  private _createComputerPage() {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = computerPageHtml;

    return tempDiv.firstElementChild! as HTMLElement;
  }
}
