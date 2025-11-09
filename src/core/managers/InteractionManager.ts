import * as THREE from "three";
import { renderingLoopManager, keyboardManager } from ".";
import type { IInteractable, IKeyboardListener, IUpdatable } from "@interfaces";

export class InteractionManager implements IUpdatable, IKeyboardListener {
  private _originElement: THREE.Object3D;

  private _interactablesMap: Map<string, IInteractable> = new Map();
  private _interactableObjects: THREE.Object3D[] = [];
  private _selectedInteractable: IInteractable | null = null;

  private _raycasterPosition = new THREE.Vector3();
  private _raycasterDirection = new THREE.Vector3();
  private _raycaster: THREE.Raycaster;

  private _near = 0.1;
  private _far = 10;

  private _promptElement: HTMLElement;
  private _promptMessage: HTMLElement;
  private _isListeningToKeyboard: boolean = false;

  constructor(originElement: THREE.Object3D, interactables: IInteractable[]) {
    this._originElement = originElement;

    interactables.forEach((interactable) => {
      interactable.objects.forEach((interactableObject) => {
        this._interactableObjects.push(interactableObject);
        this._interactablesMap.set(interactableObject.uuid, interactable);
      });
    });

    this._raycaster = new THREE.Raycaster(
      this._originElement.getWorldPosition(this._raycasterPosition),
      this._originElement.getWorldDirection(this._raycasterDirection),
      this._near,
      this._far
    );

    const promptContainer = document.createElement("div");
    promptContainer.classList.add("interaction-prompt");

    const promptMessage = document.createElement("p");

    promptContainer.appendChild(promptMessage);

    this._promptElement = promptContainer;
    this._promptMessage = promptMessage;

    document.body.appendChild(this._promptElement);

    renderingLoopManager.subscribe(this);
  }

  onKeyDown(keyCode: string): void {
    if (keyCode !== "KeyE") {
      console.warn(`This class shouldn't listen to ${keyCode} events`);
      return;
    }

    this._selectedInteractable?.onInteract();
  }

  showPrompt(text: string) {
    this._promptMessage.innerText = `Press [E] To ${text}`;
    this._promptElement.classList.add("visible");
  }

  hidePrompt() {
    this._promptElement.classList.remove("visible");
  }

  update(): void {
    this._updateRaycaster();

    const intersects = this._raycaster.intersectObjects(
      this._interactableObjects,
      false
    );

    const firstIntersect = intersects.length ? intersects[0] : null;
    const interactable = firstIntersect
      ? this._interactablesMap.get(firstIntersect.object.uuid)
      : null;

    if (interactable) {
      if (!this._isListeningToKeyboard) {
        keyboardManager.subscribe(this, ["KeyE"], false);
        this._isListeningToKeyboard = true;
      }

      if (this._selectedInteractable !== interactable) {
        this._selectedInteractable = interactable;
        this.showPrompt(interactable.getPromptText());
      }
    } else {
      if (this._isListeningToKeyboard) {
        keyboardManager.unsubscribe(this);
        this._isListeningToKeyboard = false;
      }

      this._selectedInteractable = null;
      this.hidePrompt();
    }
  }

  private _updateRaycaster() {
    this._originElement.getWorldPosition(this._raycasterPosition);
    this._originElement.getWorldDirection(this._raycasterDirection);
    this._raycaster.set(this._raycasterPosition, this._raycasterDirection);
  }
}
