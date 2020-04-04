import * as BABYLON from "babylonjs";

import { SampleMaterial } from "./Materials/SampleMaterial";

export class Main {
    constructor() {
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
      scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
      scene.collisionsEnabled = true;

      // Lights
      var torch = new BABYLON.PointLight("light1",BABYLON.Vector3.Zero(), scene);
      torch.intensity = 0.7;
      torch.diffuse = BABYLON.Color3.FromHexString('#ff9944');

      var sky = new BABYLON.HemisphericLight("sky", new BABYLON.Vector3(0, 1.0, 0), scene);
      sky.intensity = 0.5;

      // Material
      var player1Mat = new BABYLON.StandardMaterial("pmat", scene);
      player1Mat.emissiveColor = BABYLON.Color3.FromHexString('#ff9900');
      player1Mat.specularPower = 64;

      var playereMat = new BABYLON.StandardMaterial("pemat", scene);
      playereMat.emissiveColor = BABYLON.Color3.FromHexString('#ffffff');
      playereMat.specularPower = 128;

      var playerbMat = new BABYLON.StandardMaterial("pbmat", scene);
      playerbMat.diffuseColor = BABYLON.Color3.Black();

      // Player ----
      const player = BABYLON.Mesh.CreateSphere("playerbody", 8, 1.8, scene);
      player.material = player1Mat;
      player.position.y = 0.9;

      var playere1 = BABYLON.Mesh.CreateSphere("eye1", 8, 0.5, scene);
      playere1.material = playereMat;
      playere1.position.y = 0.5;
      playere1.position.z = 0.5;
      playere1.position.x = -0.3;
      playere1.parent = player;

      var playere2 = BABYLON.Mesh.CreateSphere("eye2", 8, 0.5, scene);
      playere2.material = playereMat;
      playere2.position.y = 0.5;
      playere2.position.z = 0.5;
      playere2.position.x = 0.3;
      playere2.parent = player;

      var playereb1 = BABYLON.Mesh.CreateSphere("eye1b", 8, 0.25, scene);
      playereb1.material = playerbMat;
      playereb1.position.y = 0.5;
      playereb1.position.z = 0.7;
      playereb1.position.x = -0.3;
      playereb1.parent = player;

      var playereb2 = BABYLON.Mesh.CreateSphere("eye2b", 8, 0.25, scene);
      playereb2.material = playerbMat;
      playereb2.position.y = 0.5;
      playereb2.position.z = 0.7;
      playereb2.position.x = 0.3;
      playereb2.parent = player;

      player.checkCollisions = true;
      player.ellipsoid = new BABYLON.Vector3(0.9, 0.45, 0.9);
      let playerSpeed = new BABYLON.Vector3(0, 0, 0.08);
      let playerNextspeed = new BABYLON.Vector3(0, 0, 0);
      let playerNexttorch = new BABYLON.Vector3(0, 0, 0);

      // Camera
      const cameraDistance = 25;
      const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(player.position.x, player.position.y + 5, player.position.z - 45), scene);
      camera.radius = cameraDistance; // how far from the object to follow
      camera.heightOffset = 3; // how high above the object to place the camera
      camera.rotationOffset = 90; // the viewing angle
      camera.cameraAcceleration = 0; // how fast to move
      camera.maxCameraSpeed = 20; // speed limit
      camera.attachControl(canvas, true);
      camera.lockedTarget = player; // target any mesh or object with a "position" Vector3
      
      scene.activeCamera = camera;

      var lightImpostor = BABYLON.Mesh.CreateSphere("sphere1", 16, 0.1, scene);
      var lightImpostorMat = new BABYLON.StandardMaterial("mat", scene);
      lightImpostor.material = lightImpostorMat;
      lightImpostorMat.emissiveColor = BABYLON.Color3.Yellow();
      lightImpostorMat.linkEmissiveWithDiffuse = true;
      lightImpostor.position.y = 0;
      lightImpostor.position.z = 0;
      lightImpostor.position.x = 0;
      lightImpostor.parent = player;

      // Ground
      var ground = BABYLON.Mesh.CreatePlane("g", 120, scene);
      ground.position = new BABYLON.Vector3(0, 0, 0);
      ground.rotation.x = Math.PI / 2;
      ground.receiveShadows = true;
      ground.checkCollisions = true;

      var wall1 = BABYLON.Mesh.CreateBox("w1", 3, scene);
      wall1.checkCollisions = true;
      wall1.position = new BABYLON.Vector3(8, 4.5, 5);

      var wall2 = BABYLON.Mesh.CreateBox("w2", 3, scene);
      wall2.checkCollisions = true;
      wall2.position = new BABYLON.Vector3(11, 1.5, 5);

      var wall3 = BABYLON.Mesh.CreateBox("w3", 3, scene);
      wall3.checkCollisions = true;
      wall3.position = new BABYLON.Vector3(5, 1.5, 5);

      // Keypress events
      const inputMap ={};
      scene.actionManager = new BABYLON.ActionManager(scene);
      scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
          inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }));
      scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
          inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }));

      let tempv = new BABYLON.Vector3(0, 0, 0);

      scene.registerBeforeRender(function () {
          // Player speed
          var v = 0.5;
          playerNextspeed.x = 0.0;
          playerNextspeed.z = 0.00001;
          if (inputMap["w"] || inputMap["ArrowUp"]) {
            playerNextspeed.x = -v;
            playerNextspeed.z = v;
          }
          if (inputMap["a"] || inputMap["ArrowLeft"]) {
            playerNextspeed.x = -v;
            playerNextspeed.z = -v;
          }
          if (inputMap["s"] || inputMap["ArrowDown"]) {
            playerNextspeed.x = v;
            playerNextspeed.z = -v;
          }
          if (inputMap["d"] || inputMap["ArrowRight"]) {
            playerNextspeed.x = v;
            playerNextspeed.z = v;
          }

          playerSpeed = BABYLON.Vector3.Lerp(playerSpeed, playerNextspeed, 0.1);

          // Turn to direction
          if (playerSpeed.length() > 0.01) {
              tempv.copyFrom(playerSpeed);
              const dot = BABYLON.Vector3.Dot(tempv.normalize(), BABYLON.Axis.Z);
              let al = Math.acos(dot);
              let t = 0;
              if (tempv.x < 0.0) { al = Math.PI * 2.0 - al; }
              if (al > player.rotation.y) {
                t = Math.PI / 30;
              } else {
                t = -Math.PI / 30;
              }
              var ad = Math.abs(player.rotation.y - al);
              if (ad > Math.PI) {
                  t = -t;
              }
              if (ad < Math.PI / 15) {
                  t = 0;
              }
              player.rotation.y += t;
              if (player.rotation.y > Math.PI * 2) { player.rotation.y -= Math.PI * 2; }
              if (player.rotation.y < 0 ) { player.rotation.y += Math.PI * 2; }
          }

          player.moveWithCollisions(playerSpeed);

          if (player.position.x > 60.0) { player.position.x = 60.0; }
          if (player.position.x < -60.0) { player.position.x = -60.0; }
          if (player.position.z > 60.0) { player.position.z = 60.0; }
          if (player.position.z < -60.0) { player.position.z = -60.0; }

          playerNexttorch = lightImpostor.getAbsolutePosition();
          torch.position.copyFrom(playerNexttorch);
          torch.intensity = 1;
          torch.position.x += Math.random() * 0.125 - 0.0625;
          torch.position.z += Math.random() * 0.125 - 0.0625;

          camera.position.x = player.position.x + cameraDistance;
          camera.position.y = player.position.y + cameraDistance;
          camera.position.z = player.position.z - cameraDistance;
      });

      // Game loop
      engine.runRenderLoop(() => {
          scene.render();
      });
    }
}

new Main();