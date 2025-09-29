export default interface IKeyboardListener {
  onKeyDown(keyCode: string): void;
  onKeyUp(keyCode: string): void;
}
