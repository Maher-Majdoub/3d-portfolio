import { App } from "./core/App";
import { Preloader } from "./core/utils/Preloader";
import { Physics } from "./core/world/Physics";
import "./style.css";

const run = async () => {
  const rapier = await import("@dimforge/rapier3d");
  const physics = new Physics(rapier);

  const app = new App(physics);

  const preloader = new Preloader(app.start);
  preloader.startLoading();
};

run();
