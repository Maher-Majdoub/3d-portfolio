import computerPageHtml from "./static/computer.html?raw";
import { formatDateTime } from "../../helpers/dateHelpers";

import "./static/computer.css";

export class ComputerUIController {
  private _viewElement: HTMLElement;
  private _updateTimeIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this._viewElement = this._createViewElement();
  }

  mount() {
    if (!document.body.contains(this._viewElement))
      document.body.appendChild(this._viewElement);

    const computerDateTime = this._viewElement.querySelector(
      "#computer-date-time"
    ) as HTMLElement;

    computerDateTime.textContent = formatDateTime();

    if (this._updateTimeIntervalId) clearInterval(this._updateTimeIntervalId);

    this._updateTimeIntervalId = setInterval(() => {
      computerDateTime.textContent = formatDateTime();
    }, 1000);
  }

  unmount() {
    if (document.body.contains(this._viewElement))
      document.body.removeChild(this._viewElement);

    if (this._updateTimeIntervalId) {
      clearInterval(this._updateTimeIntervalId);
      this._updateTimeIntervalId = null;
    }
  }

  private _createViewElement = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = computerPageHtml;

    return tempDiv.firstElementChild! as HTMLElement;
  };
}
