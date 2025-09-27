import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class App {
  private _scene: THREE.Scene;

  private _camera: THREE.PerspectiveCamera;
  private _cameraFov = 35;
  private _cameraNear = 0.1;
  private _cameraFar = 1000;

  private _renderer: THREE.WebGLRenderer;

  private _isRunning = false;

  constructor() {
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(
      this._cameraFov,
      window.innerWidth / window.innerHeight,
      this._cameraNear,
      this._cameraFar
    );

    this._camera.position.z = 5;

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.BoxGeometry();
    const mesh = new THREE.MeshBasicMaterial({ color: "red" });

    const cube = new THREE.Mesh(geometry, mesh);
    this._scene.add(cube);

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

    this._renderer.render(this._scene, this._camera);
    requestAnimationFrame(this._loop);
  };
}
