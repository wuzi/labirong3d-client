import { 
  Engine,
  Scene,
  Mesh,
  Vector3,
  PointLight,
  Color3,
  HemisphericLight,
  StandardMaterial,
  FollowCamera,
  ActionManager,
  ExecuteCodeAction,
  Axis,
} from '@babylonjs/core';

export class Main {
    constructor() {
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const engine = new Engine(canvas, true);
      const cameraDistance = 25;
      let tempv = new Vector3(0, 0, 0);
      
      const createScene = function() {
        const scene = new Scene(engine);
        scene.gravity = new Vector3(0, -0.9, 0);
        scene.collisionsEnabled = true;

        return scene;
      }

      const sceneInput = function() {
        // Keypress events
        const inputMap ={};
        scene.actionManager = new ActionManager(scene);
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {								
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {								
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        return inputMap;
      }
      const scene = createScene();
      const inputMap = sceneInput();

      const createPlayer = function() {
        // Material
        const player1Mat = new StandardMaterial("pmat", scene);
        player1Mat.emissiveColor = Color3.FromHexString('#ff9900');
        player1Mat.specularPower = 64;

        const playereMat = new StandardMaterial("pemat", scene);
        playereMat.emissiveColor = Color3.FromHexString('#ffffff');
        playereMat.specularPower = 128;

        const playerbMat = new StandardMaterial("pbmat", scene);
        playerbMat.diffuseColor = Color3.Black();

        // Player ----
        const player = Mesh.CreateSphere("playerbody", 8, 1.8, scene);
        player.material = player1Mat;
        player.position.y = 0.9;

        const playere1 = Mesh.CreateSphere("eye1", 8, 0.5, scene);
        playere1.material = playereMat;
        playere1.position.y = 0.5;
        playere1.position.z = 0.5;
        playere1.position.x = -0.3;
        playere1.parent = player;

        const playere2 = Mesh.CreateSphere("eye2", 8, 0.5, scene);
        playere2.material = playereMat;
        playere2.position.y = 0.5;
        playere2.position.z = 0.5;
        playere2.position.x = 0.3;
        playere2.parent = player;

        const playereb1 = Mesh.CreateSphere("eye1b", 8, 0.25, scene);
        playereb1.material = playerbMat;
        playereb1.position.y = 0.5;
        playereb1.position.z = 0.7;
        playereb1.position.x = -0.3;
        playereb1.parent = player;

        const playereb2 = Mesh.CreateSphere("eye2b", 8, 0.25, scene);
        playereb2.material = playerbMat;
        playereb2.position.y = 0.5;
        playereb2.position.z = 0.7;
        playereb2.position.x = 0.3;
        playereb2.parent = player;

        player.checkCollisions = true;
        player.ellipsoid = new Vector3(0.9, 0.45, 0.9);

        return player;
      }
      const player = createPlayer();

      const sceneLight = function() {
        const torch = new PointLight("light1", Vector3.Zero(), scene);
        torch.intensity = 0.7;
        torch.diffuse = Color3.FromHexString('#ff9944');
        
        return torch;
      }

      const sceneLightImpostor = function() {
        var lightImpostor = Mesh.CreateSphere("sphere1", 16, 0.1, scene);
        var lightImpostorMat = new StandardMaterial("mat", scene);
        lightImpostor.material = lightImpostorMat;
        lightImpostorMat.emissiveColor = Color3.Yellow();
        lightImpostorMat.linkEmissiveWithDiffuse = true;
        lightImpostor.position.y = 0;
        lightImpostor.position.z = 0;
        lightImpostor.position.x = 0;
        lightImpostor.parent = player;

        return lightImpostor;
      }

      const sceneSky = function() {
        const sky = new HemisphericLight("sky", new Vector3(0, 1.0, 0), scene);
        sky.intensity = 0.5;

        return sky;
      }
      const torch = sceneLight();
      const sky = sceneSky();
      const lightImpostor = sceneLightImpostor();
      
      let playerSpeed = new Vector3(0, 0, 0.08);
      let playerNextspeed = new Vector3(0, 0, 0);
      let playerNexttorch = new Vector3(0, 0, 0);

      const createCamera = function() {
        const camera = new FollowCamera("FollowCam", new Vector3(player.position.x, player.position.y + 5, player.position.z - 45), scene);
        camera.radius = cameraDistance; // how far from the object to follow
        camera.heightOffset = 3; // how high above the object to place the camera
        camera.rotationOffset = 90; // the viewing angle
        camera.cameraAcceleration = 0; // how fast to move
        camera.maxCameraSpeed = 20; // speed limit
        camera.attachControl(canvas, true);
        camera.lockedTarget = player; // target any mesh or object with a "position" Vector3

        return camera;
      }
      const camera = createCamera();

      const createMap = function() {
        var ground = Mesh.CreatePlane("g", 120, scene);
        ground.position = new Vector3(0, 0, 0);
        ground.rotation.x = Math.PI / 2;
        ground.receiveShadows = true;
        ground.checkCollisions = true;

        var wall1 = Mesh.CreateBox("w1", 3, scene);
        wall1.checkCollisions = true;
        wall1.position = new Vector3(8, 4.5, 5);

        var wall2 = Mesh.CreateBox("w2", 3, scene);
        wall2.checkCollisions = true;
        wall2.position = new Vector3(11, 1.5, 5);

        var wall3 = Mesh.CreateBox("w3", 3, scene);
        wall3.checkCollisions = true;
        wall3.position = new Vector3(5, 1.5, 5);

        return ground;
      }
      const ground = createMap();

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

          playerSpeed = Vector3.Lerp(playerSpeed, playerNextspeed, 0.1);

          // Turn to direction
          if (playerSpeed.length() > 0.01) {
              tempv.copyFrom(playerSpeed);
              const dot = Vector3.Dot(tempv.normalize(), Axis.Z);
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