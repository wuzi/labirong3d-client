import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

import Network from './network';
import GameplayScene from './scenes/gameplay';

const Main = async (): Promise<void> => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new BABYLON.Engine(canvas, true);
  const network = new Network('wss://labirong-3d-server.herokuapp.com/ws');
  const gameplay = new GameplayScene(engine, canvas, network);

  engine.runRenderLoop(() => {
    gameplay.scene.render();
  });
};

export default Main();
