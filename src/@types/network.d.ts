interface RemotePlayer {
  id: number;
  name: string;
  color: string;
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
