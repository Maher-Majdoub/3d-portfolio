import { App } from "@core/App";
import { Computer } from "@world";
import { Preloader, assetsLoader } from "@utils";

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
