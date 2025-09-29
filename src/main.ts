import { App } from "./core/App";
import { Physics } from "./core/world/Physics";
import "./style.css";

const run = async () => {
  const rapier = await import("@dimforge/rapier3d");

  const physics = new Physics(rapier);
  const app = new App(physics);

  app.start();
};

run();
