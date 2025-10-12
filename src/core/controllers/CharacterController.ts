import { Euler, Quaternion, Vector3, type Mesh } from "three";
import {
  ALL_CHARACTER_CONTROL_KEYS,
  CHARACTER_SPEED,
  KEY_TO_ACTION_MAP,
} from "../constants/character";
import { FRICTION, GRAVITY } from "../constants/physics";
import type { GLTF } from "three/examples/jsm/Addons.js";
import type { Physics } from "../world/Physics";
import type {
  Collider,
  KinematicCharacterController,
} from "@dimforge/rapier3d";
import type IKeyboardListener from "../interfaces/IKeyboardListener";
import type IUpdatable from "../interfaces/IUpdatable";
import AnimationManager from "../managers/AnimationManager";
import keyboardManager from "../managers/KeyboardManager";
import renderingLoopManager from "../managers/RenderingLoopManager";

interface MovementState {
  FORWARD: boolean;
  BACKWARD: boolean;
  LEFT: boolean;
  RIGHT: boolean;
  SPRINT: boolean;
  JUMP: boolean;
}

export default class CharacterController
  implements IKeyboardListener, IUpdatable
{
  private _movementState: MovementState = {
    FORWARD: false,
    BACKWARD: false,
    LEFT: false,
    RIGHT: false,
    JUMP: false,
    SPRINT: false,
  };

  private _mesh: Mesh;
  private _collider: Collider;
  private _controller: KinematicCharacterController;
  private _animationManager: AnimationManager;

  private _inputDirection = new Vector3(0, 1, 0);
  private _frameMovement = new Vector3();
  private _velocity = new Vector3();
  private _targetQuaternion = new Quaternion();
  private _targetQuaternionEuler = new Euler(0, 0, 0, "YXZ");

  constructor(physics: Physics, mesh: Mesh, avatar: GLTF) {
    const { collider } = physics.createCollider(
      mesh,
      mesh.getWorldPosition(new Vector3()),
      mesh.getWorldQuaternion(new Quaternion())
    );

    this._mesh = mesh;
    this._collider = collider;
    this._controller = physics.createCharacterController(0.01);
    this._animationManager = new AnimationManager(
      avatar.scene,
      avatar.animations
    );

    this._animationManager.playAnimation("idle");

    keyboardManager.subscribe(this, ALL_CHARACTER_CONTROL_KEYS, true);
    renderingLoopManager.subscribe(this);
  }

  onKeyDown(keyCode: string): void {
    this._handleKeyEvent(keyCode, true);
  }

  onKeyUp(keyCode: string): void {
    this._handleKeyEvent(keyCode, false);
  }

  update(delta: number): void {
    const isGrounded = this._controller.computedGrounded();

    if (isGrounded) this._updateInputDirection();

    this._updateVelocity(delta, isGrounded);

    this._updateFameMovement(delta);

    const dirX = Math.abs(this._frameMovement.x);
    const dirZ = Math.abs(this._frameMovement.z);
    const len = Math.hypot(dirX, dirZ);

    const isMoving = len > 0.0001;
    if (isMoving && isGrounded) this._applyRotationInfluence(delta);

    this._moveCharacter();
  }

  private _handleKeyEvent(keyCode: string, isPressed: boolean): void {
    const action = KEY_TO_ACTION_MAP[keyCode];
    if (action) {
      this._movementState[action] = isPressed;
    }
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

    this._velocity.x += FRICTION * delta;
    this._velocity.z += FRICTION * delta;
    this._velocity.y += GRAVITY * delta * 2;

    if (isGrounded) {
      const speed = this._movementState.SPRINT
        ? CHARACTER_SPEED.RUN
        : CHARACTER_SPEED.WALK;

      const dirX = Math.abs(this._inputDirection.x);
      const dirZ = Math.abs(this._inputDirection.z);
      const len = Math.hypot(dirX, dirZ);

      if (len) {
        this._velocity.x = (dirX / len) * speed;
        this._velocity.z = (dirZ / len) * speed;
      } else {
        this._velocity.x = 0;
        this._velocity.z = 0;
      }

      this._velocity.y = Math.max(0, this._velocity.y);
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
    const angleDifference = this._mesh.quaternion.angleTo(
      this._targetQuaternion
    );

    const rotationFactor = Math.max(0, 1 - angleDifference / (Math.PI / 2));

    this._frameMovement.multiplyScalar(rotationFactor);
    this._mesh.quaternion.slerp(
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
    this._mesh.position.copy(this._collider.translation());
  }
}
