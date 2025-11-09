import appContainer from "./static/app-container.html?raw";
import terminalAppHtml from "./static/terminal-app.html?raw";

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface AppWindowState {
  position: Point;
  size: Size;
  isWindowMaximized: boolean;
  previousState: {
    position: Point;
    size: Size;
  };
  dragging: {
    isDragging: boolean;
    offset: Point;
  };
}

export class ComputerApp {
  private _dom = {
    root: null as HTMLElement | null,
    header: null as HTMLElement | null,
    body: null as HTMLElement | null,
    container: null as HTMLElement | null,
    buttons: {
      toggleSize: null as HTMLElement | null,
      close: null as HTMLElement | null,
    },
  };

  private _state: AppWindowState;

  constructor() {
    const tempDiv = document.createElement("template");
    tempDiv.innerHTML = terminalAppHtml;
    const clone = tempDiv.content.cloneNode(true);

    const root = this._createRootElement();

    Object.assign(this._dom, {
      root,
      container: document.querySelector("#computer-main-view"),
      body: root.querySelector("#app-body"),
      header: root.querySelector("#app-header"),
      buttons: {
        toggleSize: root.querySelector("#toggle-window-size-btn"),
        close: root.querySelector("#close-app-btn"),
      },
    });

    this._dom.body?.appendChild(clone);

    this._state = {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      isWindowMaximized: false,
      previousState: {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
      },
      dragging: {
        isDragging: false,
        offset: { x: 0, y: 0 },
      },
    };

    this._resizeApp({ width: 500, height: 500 });
    this._moveApp({ x: 20, y: 20 });

    this._dom.header?.addEventListener("mousedown", this._onMouseDown);
    window.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("mouseup", this._onMouseUp);

    this._dom.buttons.toggleSize?.addEventListener(
      "click",
      this._onToggleWindowSize
    );

    this._dom.buttons.close?.addEventListener("click", this.destroy);
  }

  get domElement() {
    return this._dom.root;
  }

  destroy = () => {
    this._dom.header?.removeEventListener("mousedown", this._onMouseDown);
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("mouseup", this._onMouseUp);

    this._dom.buttons.toggleSize?.removeEventListener(
      "click",
      this._onToggleWindowSize
    );

    this._dom.buttons.close?.removeEventListener("click", this.destroy);

    this._dom.root?.remove();

    Object.assign(this._dom, {
      root: null,
      header: null,
      body: null,
      container: null,
      buttons: { toggleSize: null, close: null },
    });
  };

  private _onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    if (this._state.isWindowMaximized) return;

    this._state.dragging.isDragging = true;

    const dragOffset = {
      x: e.clientX - this._state.position.x,
      y: e.clientY - this._state.position.y,
    };

    this._state.dragging.offset = dragOffset;
  };

  private _onMouseMove = (e: MouseEvent) => {
    if (!this._state.dragging.isDragging) return;

    const newPoint = {
      x: e.clientX - this._state.dragging.offset.x,
      y: e.clientY - this._state.dragging.offset.y,
    };

    this._moveApp(newPoint);
  };

  private _onMouseUp = () => {
    this._state.dragging.isDragging = false;
  };

  private _onToggleWindowSize = () => {
    if (this._state.isWindowMaximized) {
      this._resizeApp(this._state.previousState.size);
      this._moveApp(this._state.previousState.position);
    } else {
      const containerRect = this._dom.container?.getBoundingClientRect();

      this._moveApp({ x: 0, y: 0 });
      this._resizeApp({
        width: containerRect?.width || 500,
        height: containerRect?.height || 500,
      });
    }

    this._state.isWindowMaximized = !this._state.isWindowMaximized;
  };

  private _moveApp = (position: Point) => {
    if (!this._dom.root) return;

    const containerRect = this._dom.container?.getBoundingClientRect();

    const maxX = (containerRect?.width || Infinity) - this._state.size.width;
    const maxY = (containerRect?.height || Infinity) - this._state.size.height;

    const finalPosition = {
      x: Math.max(0, Math.min(position.x, maxX)),
      y: Math.max(0, Math.min(position.y, maxY)),
    };

    this._dom.root.style.left = `${finalPosition.x}px`;
    this._dom.root.style.top = `${finalPosition.y}px`;

    this._state.previousState.position = { ...this._state.position };
    this._state.position = finalPosition;
  };

  private _resizeApp = (size: Size) => {
    if (!this._dom.root) return;

    this._dom.root.style.width = `${size.width}px`;
    this._dom.root.style.height = `${size.height}px`;

    this._state.previousState.size = { ...this._state.size };
    this._state.size = { ...size };
  };

  private _createRootElement = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = appContainer;

    return tempDiv.firstElementChild! as HTMLElement;
  };
}
