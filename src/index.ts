import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

import Network from './network';
import MainMenuScene from './scenes/mainmenu';
import GameplayScene from './scenes/gameplay';

const Main = async (): Promise<void> => {
  const mainmenu = new MainMenuScene();

  mainmenu.onPlayerSubmit.add((player) => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const engine = new BABYLON.Engine(canvas, true);
    const network = new Network(`wss://labirong3d-server-4u76c4574q-uc.a.run.app/ws?name=${player.name}&color=${player.color}`);
    const gameplay = new GameplayScene(engine, canvas, network, player);

    engine.runRenderLoop(() => {
      gameplay.scene.render();
    });

    mainmenu.dispose();
  });
};

export default Main();
