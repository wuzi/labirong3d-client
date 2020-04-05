import { Scene, Vector3, Engine, ActionManager, ExecuteCodeAction } from '@babylonjs/core';

export const createScene = (engine: Engine) => {
  const scene = new Scene(engine);
  scene.gravity = new Vector3(0, -0.9, 0);
  scene.collisionsEnabled = true;

  return scene;
}

export const sceneInput = (scene: Scene) => {
  const inputMap = {};
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {								
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
  }));
  scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {								
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
  }));

  return inputMap;
}