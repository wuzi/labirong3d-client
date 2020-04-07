import { SceneLoader, Scene } from '@babylonjs/core';

const loadMap = async (scene: Scene): Promise<void> => {
  const { meshes } = await SceneLoader.ImportMeshAsync('', 'assets/', 'village.obj', scene);
  meshes.map((m) => {
    const mesh = m;
    mesh.checkCollisions = true;
    return mesh;
  });
};

export default loadMap;
