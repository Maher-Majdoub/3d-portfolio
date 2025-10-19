import { App } from "./core/App";
import { Preloader } from "./core/utils/Preloader";
import assetsLoader from "./core/utils/AssetsLoader";
import "./style.css";

const onAssetsLoaded = () => {
  const app = new App(assetsLoader.physics!);
  app.start();
};

const run = async () => {
  const preloader = new Preloader(() => onAssetsLoaded());
  preloader.startLoading();
};

run();
