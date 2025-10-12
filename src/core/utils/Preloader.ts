import store from "../store/sotre";
import assetsLoader from "./AssetsLoader";

export class Preloader {
  private _loadingScreen: HTMLElement;
  private _onLoadComplete: () => void;

  constructor(onLoadComplete: () => void) {
    this._loadingScreen = this._createLoadingScreen();
    this._onLoadComplete = onLoadComplete;
  }

  startLoading() {
    if (store.getState().assets.status !== "pending") {
      this._onLoadComplete();
      return;
    }

    this._displayLoadingScreen();

    assetsLoader.startLoading();

    const unsubcribe = store.subscribe(() => {
      const state = store.getState();
      if (state.assets.status === "ready") {
        this._removeLoadingScreen();
        this._onLoadComplete();
        unsubcribe();
      }
    });
  }

  private _createLoadingScreen(): HTMLElement {
    const htmlString = `
      <div class="preloader-container" >
        <p>Loading Resources...</p>
      </div>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlString;

    return element.firstElementChild as HTMLElement;
  }

  private _displayLoadingScreen() {
    if (!document.body.contains(this._loadingScreen))
      document.body.appendChild(this._loadingScreen);
  }

  private _removeLoadingScreen() {
    if (document.body.contains(this._loadingScreen))
      document.body.removeChild(this._loadingScreen);
  }
}
