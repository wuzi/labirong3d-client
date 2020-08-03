interface RemotePlayer {
  id: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  currentAnimation: 'Idle' | 'Walking' | 'Backwards' | 'Running';
}
