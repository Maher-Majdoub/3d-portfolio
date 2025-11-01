import * as THREE from "three";
import { Character } from "./world/Character";
import { assetsMap } from "./store/assetsSlice";
import { PointerLockOverlay } from "./utils/PointerLockOverlay";
import type { Physics } from "./world/Physics";
import type IUpdatable from "./interfaces/IUpdatable";
import renderingLoopManager from "./managers/RenderingLoopManager";

export class App implements IUpdatable {
  private _scene: THREE.Scene;

  private _camera: THREE.PerspectiveCamera;
  private _cameraFov = 35;
  private _cameraNear = 0.1;
  private _cameraFar = 1000;

  private _renderer: THREE.WebGLRenderer;
  private _character: Character;

  private _physics: Physics;

  constructor(physics: Physics) {
    this._physics = physics;
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(
      this._cameraFov,
      window.innerWidth / window.innerHeight,
      this._cameraNear,
      this._cameraFar
    );

    this._camera.position.z = 10;
    this._camera.position.y = 5;

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;

    this._character = new Character(this._physics, this._camera);

    const ambientLight = new THREE.AmbientLight();
    const environment = assetsMap.get("environment")!;

    this._scene.add(this._character.mesh, ambientLight, environment.scene);

    this._updateRendererSize();

    document.body.append(this._renderer.domElement);
    window.addEventListener("resize", this._onWindowResize);

    new PointerLockOverlay(this._renderer.domElement, this.start, this.stop);
    renderingLoopManager.subscribe(this);
  }

  start = () => {
    renderingLoopManager.start();
  };

  stop = () => {
    renderingLoopManager.stop();
  };

  update() {
    this._renderer.render(this._scene, this._camera);
  }

  private _onWindowResize = () => {
    this._updateRendererSize();
    this._updateCameraAspect();
  };

  private _updateRendererSize = () => {
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private _updateCameraAspect = () => {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
  };
}
