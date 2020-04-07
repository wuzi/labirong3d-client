import { SceneLoader, Scene } from '@babylonjs/core';

const loadMap = (scene: Scene): void => {
  SceneLoader.ImportMesh('', 'assets/', 'village.obj', scene, (meshes) => {
    meshes.map((meshe) => {
      const finalMeshe = meshe;
      finalMeshe.checkCollisions = true;

      return meshe;
    });
  });
};

export default loadMap;
