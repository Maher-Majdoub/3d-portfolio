import * as THREE from "three";
import CharacterController from "../controllers/CharacterController";
import { CHARACTER_DIMENSIONS } from "../constants/character";
import { assetsMap } from "../store/assetsSlice";
import type { Physics } from "./Physics";

export class Character {
  readonly mesh: THREE.Mesh;

  constructor(physics: Physics, camera: THREE.Camera) {
    this.mesh = this._createCharacterMesh();
    this.mesh.position.y = 2;

    const avatar = assetsMap.get("avatar")!;
    avatar.scene.translateY(-CHARACTER_DIMENSIONS.HEIGHT / 2);

    this.mesh.add(avatar.scene);
    new CharacterController(physics, this.mesh, avatar, camera);
  }

  private _createCharacterMesh = (): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(
      CHARACTER_DIMENSIONS.RADIUS,
      CHARACTER_DIMENSIONS.HEIGHT,
      CHARACTER_DIMENSIONS.RADIUS
    );

    const material = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: "green",
    });

    return new THREE.Mesh(geometry, material);
  };
}
