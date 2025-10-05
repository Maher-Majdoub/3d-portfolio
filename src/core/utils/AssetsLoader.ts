import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import {
  assetsMap,
  assetsToLoad,
  onLoadAsset,
  type AssetType,
} from "../store/assetsSlice";
import store from "../store/sotre";

class AssetsLoader {
  private _gltfLoader;

  constructor() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    this._gltfLoader = new GLTFLoader();
    this._gltfLoader.setDRACOLoader(dracoLoader);
  }

  startLoading() {
    assetsToLoad.forEach(({ id, type, path }) => {
      const loader = this._getLoader(type);

      loader.load(path, (loadedAsset) => {
        assetsMap.set(id, loadedAsset);
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
export default assetsLoader;
