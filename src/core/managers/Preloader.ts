import store from "../store/sotre";

export class Preloader {
  private _loadingScreen: HTMLElement;

  constructor() {
    this._loadingScreen = this._createLoadingScreen();

    this._displayLoadingScreen();

    store.subscribe(() => {
      const state = store.getState();
      if (state.assets.status === "ready") {
        this._removeLoadingScreen();
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
