import { SceneLoader, Scene } from '@babylonjs/core';

export const loadMap = (scene: Scene) => {
  SceneLoader.ImportMesh('', 'assets/', 'village.obj', scene, function(objects) {
    objects.map((obj) => {
      obj.checkCollisions = true;
    });
  }); 
}
