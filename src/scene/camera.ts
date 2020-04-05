import {
  FollowCamera,
  Vector3,
  Mesh,
  Scene,
} from '@babylonjs/core';

export const createCamera = (
  scene: Scene, target: Mesh, canvas: HTMLCanvasElement, cameraDistance: number,
): FollowCamera => {
  const camera = new FollowCamera(
    'FollowCam',
    new Vector3(target.position.x, target.position.y + 5, target.position.z - 45),
    scene,
  );
  camera.radius = cameraDistance; // how far from the object to follow
  camera.heightOffset = 3; // how high above the object to place the camera
  camera.rotationOffset = 90; // the viewing angle
  camera.cameraAcceleration = 0; // how fast to move
  camera.maxCameraSpeed = 20; // speed limit
  camera.attachControl(canvas, true);
  camera.lockedTarget = target; // target any mesh or object with a "position" Vector3

  return camera;
};

export const cameraFollow = (
  camera: FollowCamera, target: Mesh, cameraDistance: number,
): FollowCamera => {
  const newCameraPosition = camera;
  newCameraPosition.position.x = target.position.x + cameraDistance;
  newCameraPosition.position.y = target.position.y + cameraDistance;
  newCameraPosition.position.z = target.position.z - cameraDistance;

  return newCameraPosition;
};
