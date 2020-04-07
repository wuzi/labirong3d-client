import '@babylonjs/loaders';
import { Engine, SceneLoader, Vector3 } from '@babylonjs/core';

import { cameraFollow, CAMERA_DISTANCE, createCamera } from './scene/camera';
import loadMap from './scene/map';
import { createScene, sceneInput } from './scene/scene';
import Torch from './scene/torch';
import Player from './player';
import Sunlight from './scene/sunlight';

const Main = async (): Promise<void> => {
  // Core configuration
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, true);

  // Scene configuration
  const scene = createScene(engine);
  const input = sceneInput(scene);

  // Player configuration
  const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', scene);
  const player = new Player(scene, meshes, skeletons);
  player.updateDirection();

  // Ambience configuration
  const torch = new Torch(scene);
  const sunlight = new Sunlight(scene);
  sunlight.intensity = 0.5;

  // Camera configuration
  const camera = createCamera(scene, player.mesh.body, canvas, CAMERA_DISTANCE);

  // World configuration
  scene.gravity = new Vector3(0, -9.81, 0);
  loadMap(scene);

  scene.registerBeforeRender(() => {
    // Player speed
    player.setGravity();
    player.setSpeedByInput(input);

    // Move player
    player.move();

    // Torch follow player
    torch.copyPositionFrom(player.mesh.body.position);

    // Follow target
    cameraFollow(camera, player.mesh.body, CAMERA_DISTANCE);
  });

  // Game loop
  engine.runRenderLoop(() => {
    scene.render();
  });
};

export default Main();
