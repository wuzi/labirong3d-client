import '@babylonjs/loaders';
import { SceneLoader, Vector3 } from '@babylonjs/core';

import { cameraFollow, CAMERA_DISTANCE, createCamera } from './scene/camera';
import Torch from './scene/torch';
import Player from './player';
import Sunlight from './scene/sunlight';
import Game from './game';

const Main = async (): Promise<void> => {
  // Create game
  const game = new Game();
  game.loadMap();
  game.scene.gravity = new Vector3(0, -9.81, 0);
  game.scene.debugLayer.show();

  // Player configuration
  const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', game.scene);
  const player = new Player(game.scene, meshes, skeletons);
  player.lookAtCursor();
  player.readControls();

  // Lighting configuration
  const torch = new Torch(game.scene);
  torch.intensity = 1;

  const sunlight = new Sunlight(game.scene);
  sunlight.intensity = 0.5;

  // Camera configuration
  const camera = createCamera(game.scene, player.mesh.body, game.canvas, CAMERA_DISTANCE);

  game.scene.registerBeforeRender(() => {
    player.move();
    torch.copyPositionFrom(player.position);
    cameraFollow(camera, player.mesh.body, CAMERA_DISTANCE);
  });

  // Game loop
  game.engine.runRenderLoop(() => {
    game.scene.render();
  });
};

export default Main();
