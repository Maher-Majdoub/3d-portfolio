import type { Object3D } from "three";

export interface IInteractable {
  objects: Object3D[];
  onInteract(): void;
  getPromptText(): string;
}
