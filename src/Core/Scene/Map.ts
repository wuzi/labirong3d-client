import { Mesh, Vector3, Scene } from '@babylonjs/core';

export const createMap = (scene: Scene) => {
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

export const setBounds = (player: Mesh) => {
  if (player.position.x > 60.0) { player.position.x = 60.0; }
  if (player.position.x < -60.0) { player.position.x = -60.0; }
  if (player.position.z > 60.0) { player.position.z = 60.0; }
  if (player.position.z < -60.0) { player.position.z = -60.0; }
}