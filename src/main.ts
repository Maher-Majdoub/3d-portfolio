import { App } from "./core/App";
import { Preloader } from "./core/utils/Preloader";
import { Physics } from "./core/world/Physics";
import "./style.css";

const onAssetsLoaded = (physics: Physics) => {
  const app = new App(physics);
  app.start();
};

const run = async () => {
  const rapier = await import("@dimforge/rapier3d");
  const physics = new Physics(rapier);

  const preloader = new Preloader(() => onAssetsLoaded(physics));
  preloader.startLoading();
};

run();
