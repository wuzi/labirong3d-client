import '@babylonjs/loaders';
import { SceneLoader, Vector3 } from '@babylonjs/core';

import Torch from './scene/torch';
import Player from './player';
import Sunlight from './scene/sunlight';
import Game from './game';
import FollowCamera from './camera/follow';
import Network from './network';

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

  // Create camera
  const camera = new FollowCamera(game, player.mesh.body);

  // Connect to server
  try {
    const network = new Network('ws://localhost:8080/ws');
    await network.connect();

    player.id = await network.getClientId();
    network.listen(game);
  } catch (err) {
    // eslint-disable-next-line no-alert
    alert('Failed to connect to server!');
  }

  // Do stuff before render
  game.scene.registerBeforeRender(() => {
    player.move();
    torch.copyPositionFrom(player.position);
    camera.follow(player.mesh.body);
  });

  // Game loop
  game.engine.runRenderLoop(() => {
    game.scene.render();
  });
};

export default Main();
