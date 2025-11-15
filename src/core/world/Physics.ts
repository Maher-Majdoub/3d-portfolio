import type { RigidBody, World } from "@dimforge/rapier3d";
import { Matrix4, Quaternion, Vector3, type Mesh } from "three";
import { GRAVITY } from "@constants/physics";
import type { IUpdatable } from "@interfaces";
import { renderingLoopManager } from "@managers";

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
    const { rigidBody } = this.createCollider(mesh, type);

    if (!rigidBody) throw new Error("Mesh should have a rigid body");

    if (type === "dynamic") {
      this._meshRigidBodyMap.set(mesh, rigidBody);
    }
  }

  createCollider(mesh: Mesh, rigidBodyType?: "fixed" | "dynamic") {
    mesh.updateMatrixWorld(true);

    const worldPos = new Vector3();
    const worldQuat = new Quaternion();
    const worldScale = new Vector3();
    mesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);

    const size = new Vector3();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox!.getSize(size);

    size.multiply(worldScale);

    const colliderDesc = this._rapier.ColliderDesc.cuboid(
      size.x / 2,
      size.y / 2,
      size.z / 2
    );

    let rigidBody;

    if (rigidBodyType) {
      let rigidBodyDesc;

      if (rigidBodyType === "fixed")
        rigidBodyDesc = this._rapier.RigidBodyDesc.fixed();
      else rigidBodyDesc = this._rapier.RigidBodyDesc.dynamic();

      rigidBody = this._world.createRigidBody(rigidBodyDesc);
      rigidBody.setTranslation(worldPos, true);
      rigidBody.setRotation(worldQuat, true);
    }

    const collider = this._world.createCollider(colliderDesc, rigidBody);

    if (!rigidBody) {
      collider.setTranslation(worldPos);
      collider.setRotation(worldQuat);
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
