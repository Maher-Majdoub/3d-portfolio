import type { RigidBody, World } from "@dimforge/rapier3d";
import { Matrix4, Quaternion, Vector3, type Mesh } from "three";
import { GRAVITY } from "../constants/physics";
import type IUpdatable from "../interfaces/IUpdatable";
import renderingLoopManager from "../managers/RenderingLoopManager";

type Rapier = typeof import("@dimforge/rapier3d");

export class Physics implements IUpdatable {
  private _rapier: Rapier;
  private _world: World;

  private _meshRigidBodyMap: Map<Mesh, RigidBody> = new Map();

  constructor(rapier: Rapier) {
    this._rapier = rapier;

    const gravity = new this._rapier.Vector3(0, GRAVITY, 0);
    this._world = new this._rapier.World(gravity);

    renderingLoopManager.subscribe(this);
  }

  add(mesh: Mesh, type: "fixed" | "dynamic") {
    const position = mesh.getWorldPosition(new Vector3());
    const rotation = mesh.getWorldQuaternion(new Quaternion());

    const { rigidBody } = this.createCollider(mesh, position, rotation, type);

    if (!rigidBody) throw new Error("Mesh should have a rigid body");

    if (type === "dynamic") {
      this._meshRigidBodyMap.set(mesh, rigidBody);
    }
  }

  createCollider(
    mesh: Mesh,
    initialPosition: Vector3,
    initialRotation: Quaternion,
    rigidBodyType?: "fixed" | "dynamic"
  ) {
    const dimentions = new Vector3();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox!.getSize(dimentions);

    dimentions.multiply(mesh.getWorldScale(new Vector3()));

    const colliderDesc = this._rapier.ColliderDesc.cuboid(
      dimentions.x / 2,
      dimentions.y / 2,
      dimentions.z / 2
    );

    let rigidBody;

    if (rigidBodyType) {
      let rigidBodyDesc;

      if (rigidBodyType === "fixed")
        rigidBodyDesc = this._rapier.RigidBodyDesc.fixed();
      else rigidBodyDesc = this._rapier.RigidBodyDesc.dynamic();

      rigidBody = this._world.createRigidBody(rigidBodyDesc);
      rigidBody.setTranslation(initialPosition, true);
      rigidBody.setRotation(initialRotation, true);
    }

    const collider = this._world.createCollider(colliderDesc, rigidBody);

    if (!rigidBody) {
      collider.setTranslation(initialPosition);
      collider.setRotation(initialRotation);
    }

    return { collider, rigidBody };
  }

  createCharacterController(offset: number) {
    const controller = this._world.createCharacterController(offset);
    controller.enableAutostep(0.5, 0.2, false);
    return controller;
  }

  update() {
    this._world.step();

    this._meshRigidBodyMap.forEach((rigidBody, mesh) => {
      const position = new Vector3().copy(rigidBody.translation());
      const rotation = new Quaternion().copy(rigidBody.rotation());

      mesh.parent?.worldToLocal(position);
      mesh.position.copy(position);

      const inverseParentMatrix = new Matrix4()
        .extractRotation(mesh.parent!.matrixWorld)
        .invert();

      const inverseParentRotation = new Quaternion().setFromRotationMatrix(
        inverseParentMatrix
      );

      rotation.premultiply(inverseParentRotation);
      mesh.quaternion.copy(rotation);
    });
  }
}
