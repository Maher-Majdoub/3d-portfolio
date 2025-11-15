import { App } from "@core/App";
import { Preloader, assetsLoader } from "@utils";

const onAssetsLoaded = () => {
  new App(assetsLoader.physics!);
};

const run = async () => {
  const preloader = new Preloader(() => onAssetsLoaded());
  preloader.startLoading();
};

run();
