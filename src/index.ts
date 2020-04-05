import { Engine, Vector3 } from '@babylonjs/core';

import { createScene, sceneInput } from './Core/Scene/Scene';
import { createPlayer, playerMove, playerDirection } from './Core/Player/Player';
import { sceneLight, sceneSky, sceneLightImpostor } from './Core/Scene/Light';
import { createCamera, cameraFollow } from './Core/Scene/Camera';
import { createMap, setBounds } from './Core/Scene/Map';

export class Main {
    constructor() {
      // Core configuration
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const engine = new Engine(canvas, true);
      const cameraDistance = 25;

      // Player Move configuration
      let playerSpeed = new Vector3(0, 0, 0.08);
      let playerNextspeed = new Vector3(0, 0, 0);
      let playerNexttorch = new Vector3(0, 0, 0);
      
      // Scene configuration
      const scene = createScene(engine);
      const input = sceneInput(scene);

      // Player configuration
      const player = createPlayer(scene);

      // Ambience configuration
      const torch = sceneLight(scene);
      sceneSky(scene);
      const lightImpostor = sceneLightImpostor(scene, player);

      // Camera configuration
      const camera = createCamera(scene, player, canvas, cameraDistance);

      // World configuration
      createMap(scene);

      scene.registerBeforeRender(function () {
        playerSpeed = Vector3.Lerp(playerSpeed, playerNextspeed, 0.1);

        // Player speed
        playerMove(input, playerNextspeed);

        // Turn to direction
        playerDirection(player, playerSpeed);

        // Set Map Bounds
        setBounds(player);
        
        // Torch follow player
        playerNexttorch = lightImpostor.getAbsolutePosition();
        torch.position.copyFrom(playerNexttorch);
        torch.intensity = 1;
        torch.position.x += Math.random() * 0.125 - 0.0625;
        torch.position.z += Math.random() * 0.125 - 0.0625;

        // Follow target
        cameraFollow(camera, player, cameraDistance);
      });

      // Game loop
      engine.runRenderLoop(() => {
          scene.render();
      });
    }
}

new Main();