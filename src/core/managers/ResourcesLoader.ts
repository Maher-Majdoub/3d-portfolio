import { onLoadResource, resoucesToLoad } from "../store/resourcesSlice";
import store from "../store/sotre";

export class ResourcesLoader {
  startLoading() {
    resoucesToLoad.forEach(({ id, type, path }) => {
      switch (type) {
        case "module":
          this._loadModule(id, path);
          break;
      }
    });
  }

  private _loadModule(id: string, path: string) {
    import(path).then((_module) =>
      store.dispatch(onLoadResource({ id, resource: _module }))
    );
  }
}
