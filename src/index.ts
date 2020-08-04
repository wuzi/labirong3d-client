import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

import GameplayScene from './scenes/gameplay';
import Network from './network';
import Chatbox from './network/chatbox';
import Torch from './entities/torch';
import Player from './entities/player';
import Sunlight from './entities/sunlight';
import Camera from './entities/camera';

const Main = async (): Promise<void> => {
  // Connect to game server
  const network = new Network('wss://labirong-3d-server.herokuapp.com/ws');

  // Create scene
  const gameplay = new GameplayScene(network);
  gameplay.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

  // Create local player
  const { meshes, skeletons } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'character.babylon', gameplay.scene);

  const material = new BABYLON.StandardMaterial('characterMat', gameplay.scene);
  material.diffuseTexture = new BABYLON.Texture('assets/textures/character.png', gameplay.scene);

  const player = new Player(gameplay.scene, meshes[0], skeletons[0], material, gameplay.network);
  player.position = gameplay.getRandomSpawn();
  player.readControls();

  // Lighting configuration
  const torch = new Torch(gameplay.scene);
  torch.intensity = 1;

  const sunlight = new Sunlight(gameplay.scene);
  sunlight.intensity = 0.5;

  // Create camera
  const camera = new Camera(gameplay.scene, gameplay.canvas);
  camera.lockTarget(player.mesh);

  // Create chatbox
  const chatbox = new Chatbox();
  chatbox.show();
  gameplay.scene.onKeyboardObservable.add((e) => {
    if (e.event.keyCode === 13) {
      chatbox.focus();
    }
  });

  // Do stuff before render
  gameplay.scene.registerBeforeRender(() => {
    player.move();
    torch.copyPositionFrom(player.position);
  });

  // Scene loop
  gameplay.engine.runRenderLoop(() => {
    gameplay.scene.render();
  });
};

export default Main();
