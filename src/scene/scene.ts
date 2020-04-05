import {
  Scene, Vector3, Engine, ActionManager, ExecuteCodeAction,
} from '@babylonjs/core';

export const createScene = (engine: Engine): Scene => {
  const scene = new Scene(engine);
  scene.gravity = new Vector3(0, -0.9, 0);
  scene.collisionsEnabled = true;

  return scene;
};

export const sceneInput = (scene: Scene): any => {
  const inputMap = {};
  const sceneCopy = scene;

  sceneCopy.actionManager = new ActionManager(sceneCopy);
  sceneCopy.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, ((evt) => {
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
    })),
  );

  sceneCopy.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, ((evt) => {
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
    })),
  );

  return inputMap;
};
