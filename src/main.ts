import { App } from "./core/App";
import { Preloader } from "./core/utils/Preloader";
import { Computer } from "./core/world/computer/Computer";
import assetsLoader from "./core/utils/AssetsLoader";
import "./style.css";

const onAssetsLoaded = () => {
  const app = new App(assetsLoader.physics!);
  app.stop();

  const computer = new Computer([]);
  computer.onInteract();
};

const run = async () => {
  const preloader = new Preloader(() => onAssetsLoaded());
  preloader.startLoading();
};

run();
