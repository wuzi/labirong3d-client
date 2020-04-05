import { Engine, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';

import { createScene, sceneInput } from './scene/scene';
import { sceneLight, sceneSky, sceneLightImpostor } from './scene/light';
import { createCamera, cameraFollow } from './scene/camera';
import loadMap from './scene/map';
import Player from './player';

const Main = (): void => {
  // Core configuration
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const cameraDistance = 25;

  // Player Move configuration
  let playerNexttorch = new Vector3(0, 0, 0);

  // Scene configuration
  const scene = createScene(engine);
  const input = sceneInput(scene);

  // Player configuration
  const player = new Player(scene);

  // Ambience configuration
  const torch = sceneLight(scene);
  sceneSky(scene);
  const lightImpostor = sceneLightImpostor(scene, player.mesh.body);

  // Camera configuration
  const camera = createCamera(scene, player.mesh.body, canvas, cameraDistance);

  // World configuration
  loadMap(scene);

  scene.registerBeforeRender(() => {
    // Player speed
    player.setSpeedByInput(input);

    // Turn direction based on speed
    player.updateDirection();

    // Move player
    player.move();

    // Torch follow player
    playerNexttorch = lightImpostor.getAbsolutePosition();
    torch.position.copyFrom(playerNexttorch);
    torch.intensity = 1;
    torch.position.x += Math.random() * 0.125 - 0.0625;
    torch.position.z += Math.random() * 0.125 - 0.0625;

    // Follow target
    cameraFollow(camera, player.mesh.body, cameraDistance);
  });

  // Game loop
  engine.runRenderLoop(() => {
    scene.render();
  });
};

export default Main();
