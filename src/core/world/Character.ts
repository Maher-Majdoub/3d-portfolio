import * as THREE from "three";
import type IKeyboardListener from "../interfaces/IKeyboardListener";
import keyboardManager from "../managers/KeyboardManager";
import type {
  Collider,
  KinematicCharacterController,
} from "@dimforge/rapier3d";
import type { Physics } from "./Physics";
import {
  ALL_CHARACTER_CONTROL_KEYS,
  CHARACTER_DIMENSIONS,
  CHARACTER_SPEED,
  KEY_TO_ACTION_MAP,
} from "../constants/character";
import { FRICTION, GRAVITY } from "../constants/physics";

interface MovementState {
  FORWARD: boolean;
  BACKWARD: boolean;
  LEFT: boolean;
  RIGHT: boolean;
  SPRINT: boolean;
  JUMP: boolean;
}

export class Character implements IKeyboardListener {
  readonly mesh: THREE.Mesh;
  private _collider: Collider;
  private _controller: KinematicCharacterController;

  private _movementState: MovementState = {
    FORWARD: false,
    BACKWARD: false,
    LEFT: false,
    RIGHT: false,
    JUMP: false,
    SPRINT: false,
  };

  private _inputDirection = new THREE.Vector3(0, 1, 0);
  private _frameMovement = new THREE.Vector3();
  private _velocity = new THREE.Vector3();
  private _targetQuaternion = new THREE.Quaternion();
  private _targetQuaternionEuler = new THREE.Euler(0, 0, 0, "YXZ");

  constructor(physics: Physics) {
    this.mesh = this._createCharacterMesh();
    this.mesh.position.y = 2;

    const { collider } = physics.createCollider(
      this.mesh,
      this.mesh.getWorldPosition(new THREE.Vector3()),
      this.mesh.getWorldQuaternion(new THREE.Quaternion())
    );
    this._collider = collider;
    this._controller = physics.createCharacterController(0.01);

    keyboardManager.subscribe(this, ALL_CHARACTER_CONTROL_KEYS, true);
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

  onKeyDown(keyCode: string): void {
    this._handleKeyEvent(keyCode, true);
  }

  onKeyUp(keyCode: string): void {
    this._handleKeyEvent(keyCode, false);
  }

  private _handleKeyEvent(keyCode: string, isPressed: boolean): void {
    const action = KEY_TO_ACTION_MAP[keyCode];
    if (action) {
      this._movementState[action] = isPressed;
    }
  }

  update() {
    const delta = 0.01; // TODO: change this
    const isGrounded = this._controller.computedGrounded();

    this._updateVelocity(delta, isGrounded);

    if (isGrounded) this._updateInputDirection();

    this._updateFameMovement(delta);

    const isMoving = this._frameMovement.lengthSq() > 0.001;
    if (isMoving && isGrounded) this._applyRotationInfluence(delta);

    this._moveCharacter();
  }

  private _updateInputDirection() {
    this._inputDirection.set(
      +this._movementState.RIGHT - +this._movementState.LEFT,
      1,
      +this._movementState.BACKWARD - +this._movementState.FORWARD
    );
  }

  private _updateFameMovement(delta: number) {
    this._frameMovement
      .copy(this._inputDirection)
      .multiply(this._velocity)
      .multiplyScalar(delta);

    this._controller.computeColliderMovement(
      this._collider,
      this._frameMovement
    );
    this._frameMovement.copy(this._controller.computedMovement());
  }

  private _updateVelocity(delta: number, isGrounded: boolean) {
    if (this._movementState.JUMP) {
      if (isGrounded) this._velocity.y += CHARACTER_SPEED.JUMP;
      this._movementState.JUMP = false;
    }

    if (isGrounded) {
      const speed = this._movementState.SPRINT
        ? CHARACTER_SPEED.RUN
        : CHARACTER_SPEED.WALK;

      const dirX = Math.abs(this._inputDirection.x);
      const dirZ = Math.abs(this._inputDirection.z);
      const len = Math.hypot(dirX, dirZ);

      this._velocity.x = (dirX / len) * speed;
      this._velocity.z = (dirZ / len) * speed;

      this._velocity.y = Math.max(0, this._velocity.y);
    } else {
      this._velocity.x += FRICTION * delta;
      this._velocity.z += FRICTION * delta;

      this._velocity.y += GRAVITY * delta;
    }

    this._velocity.x = Math.max(this._velocity.x, 0);
    this._velocity.z = Math.max(this._velocity.z, 0);
  }

  private _applyRotationInfluence(delta: number) {
    const targetAngle = Math.atan2(
      this._frameMovement.x,
      this._frameMovement.z
    );

    this._targetQuaternionEuler.y = targetAngle;

    this._targetQuaternion.setFromEuler(this._targetQuaternionEuler);
    const angleDifference = this.mesh.quaternion.angleTo(
      this._targetQuaternion
    );

    const rotationFactor = Math.max(0, 1 - angleDifference / (Math.PI / 2));

    this._frameMovement.multiplyScalar(rotationFactor);
    this.mesh.quaternion.slerp(
      this._targetQuaternion,
      CHARACTER_SPEED.ROTATION * delta
    );
  }

  private _moveCharacter() {
    const currentTranslation = this._collider.translation();
    this._collider.setTranslation({
      x: currentTranslation.x + this._frameMovement.x,
      y: currentTranslation.y + this._frameMovement.y,
      z: currentTranslation.z + this._frameMovement.z,
    });
    this.mesh.position.copy(this._collider.translation());
  }
}
