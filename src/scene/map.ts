import { SceneLoader, Scene } from '@babylonjs/core';

const loadMap = (scene: Scene): void => {
  SceneLoader.ImportMesh('', 'assets/', 'village.obj', scene, (objects) => {
    objects.map((obj) => {
      const object = obj;
      object.checkCollisions = true;

      return object;
    });
  });
};

export default loadMap;
