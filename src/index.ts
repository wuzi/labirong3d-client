import '@babylonjs/loaders';
import { SceneLoader, Vector3 } from '@babylonjs/core';

import GameplayScene from './scenes/gameplay';
import Network from './network';
import Torch from './entities/torch';
import Player from './entities/player';
import Sunlight from './entities/sunlight';
import Camera from './entities/camera';

const Main = async (): Promise<void> => {
  // Connect to game server
  const network = new Network('wss://labirong-3d-server.herokuapp.com/ws');

  // Create game
  const gameplay = new GameplayScene(network);
  gameplay.scene.gravity = new Vector3(0, -9.81, 0);

  // Create local player
  const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', gameplay.scene);
  const player = new Player(gameplay.scene, meshes[0], skeletons[0], gameplay.network);
  player.position.x = gameplay.getRandomSpawn();
  player.position.z = 8 - 64;
  player.readControls();

  // Lighting configuration
  const torch = new Torch(gameplay.scene);
  torch.intensity = 1;

  const sunlight = new Sunlight(gameplay.scene);
  sunlight.intensity = 0.5;

  // Create camera
  const camera = new Camera(gameplay.scene, gameplay.canvas);
  camera.lockTarget(player.mesh);

  // Do stuff before render
  gameplay.scene.registerBeforeRender(() => {
    player.move();
    torch.copyPositionFrom(player.position);
  });

  // Game loop
  gameplay.engine.runRenderLoop(() => {
    gameplay.scene.render();
  });
};

export default Main();
