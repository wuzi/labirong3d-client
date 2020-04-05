import { StandardMaterial, Color3, Mesh, Vector3, Scene, Axis } from '@babylonjs/core';

export const createPlayer = (scene: Scene) => {
  // Material
  const player1Mat = new StandardMaterial("pmat", scene);
  player1Mat.emissiveColor = Color3.FromHexString('#ff9900');
  player1Mat.specularPower = 64;

  const playereMat = new StandardMaterial("pemat", scene);
  playereMat.emissiveColor = Color3.FromHexString('#ffffff');
  playereMat.specularPower = 128;

  const playerbMat = new StandardMaterial("pbmat", scene);
  playerbMat.diffuseColor = Color3.Black();

  // Player
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

export const playerMove = (input: any, playerNextspeed: Vector3) => {
  var v = 0.5;
  playerNextspeed.x = 0.0;
  playerNextspeed.z = 0.00001;
  if (input["w"] || input["ArrowUp"]) {
    playerNextspeed.x = -v;
    playerNextspeed.z = v;
  }
  if (input["a"] || input["ArrowLeft"]) {
    playerNextspeed.x = -v;
    playerNextspeed.z = -v;
  }
  if (input["s"] || input["ArrowDown"]) {
    playerNextspeed.x = v;
    playerNextspeed.z = -v;
  }
  if (input["d"] || input["ArrowRight"]) {
    playerNextspeed.x = v;
    playerNextspeed.z = v;
  }
}

export const playerDirection = (player: Mesh, playerSpeed: Vector3) => {
  const tempv = new Vector3(0, 0, 0);

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

    const ad = Math.abs(player.rotation.y - al);

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
}