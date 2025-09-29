import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Character } from "./world/Character";
import type { Physics } from "./world/Physics";

export class App {
  private _scene: THREE.Scene;

  private _camera: THREE.PerspectiveCamera;
  private _cameraFov = 35;
  private _cameraNear = 0.1;
  private _cameraFar = 1000;

  private _renderer: THREE.WebGLRenderer;
  private _character: Character;

  private _physics: Physics;

  private _isRunning = false;

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

    this._character = new Character(this._physics);

    const groundGeometry = new THREE.BoxGeometry(1000, 1, 1000);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: "white" });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

    this._scene.add(this._character.mesh, groundMesh);
    this._physics.add(groundMesh, "fixed");

    new OrbitControls(this._camera, this._renderer.domElement);

    this._updateRendererSize();

    document.body.append(this._renderer.domElement);
    window.addEventListener("resize", this._onWindowResize);
  }

  start() {
    this._isRunning = true;
    this._loop();
  }

  stop() {
    this._isRunning = false;
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

  private _loop = () => {
    if (!this._isRunning) return;

    this._physics.update();
    this._character.update();
    this._renderer.render(this._scene, this._camera);
    requestAnimationFrame(this._loop);
  };
}
