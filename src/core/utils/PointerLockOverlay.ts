export class PointerLockOverlay {
  private _domElement: HTMLElement;
  private _overlayElement: HTMLElement;

  constructor(
    domElement: HTMLElement,
    onStart: () => void,
    onStop: () => void
  ) {
    this._domElement = domElement;
    this._overlayElement = this._createOvelayElement();

    document.body.appendChild(this._overlayElement);

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this._domElement) {
        this._removeOverlay();
        onStart();
      } else {
        this._displayOverlay();
        onStop();
      }
    });
  }

  private _createOvelayElement(): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("overlay");

    const resumeBtn = document.createElement("button");
    resumeBtn.innerText = "Resume";
    resumeBtn.addEventListener("click", this._onResume);

    container.appendChild(resumeBtn);

    return container;
  }

  private _displayOverlay() {
    if (!document.body.contains(this._overlayElement))
      document.body.appendChild(this._overlayElement);
  }

  private _removeOverlay() {
    if (document.body.contains(this._overlayElement))
      document.body.removeChild(this._overlayElement);
  }

  private _onResume = () => {
    this._domElement.requestPointerLock();
  };
}
