import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import {
  assetsMap,
  assetsToLoad,
  onLoadAsset,
  type AssetType,
} from "@store/assetsSlice";
import store from "@store/store";
import { Physics } from "@world";
import { Mesh } from "three";

class AssetsLoader {
  private _gltfLoader;
  physics: Physics | null = null;

  constructor() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    this._gltfLoader = new GLTFLoader();
    this._gltfLoader.setDRACOLoader(dracoLoader);
  }

  async startLoading() {
    const rapier = await import("@dimforge/rapier3d");
    const physics = new Physics(rapier);
    this.physics = physics;

    assetsToLoad.forEach(({ id, type, path }) => {
      const loader = this._getLoader(type);

      loader.load(path, (loadedAsset) => {
        assetsMap.set(id, loadedAsset);

        loadedAsset.scene.children.forEach((child) => {
          if (child.name.includes("static")) {
            child.traverse((object) => {
              if (object instanceof Mesh) physics.add(object, "fixed");
            });
          }
        });

        store.dispatch(onLoadAsset({ id }));
      });
    });
  }

  private _getLoader(assetType: AssetType) {
    switch (assetType) {
      case "gltf":
        return this._gltfLoader;
      default:
        throw new Error("Unsupported asset type");
    }
  }
}

const assetsLoader = new AssetsLoader();
export { assetsLoader };
