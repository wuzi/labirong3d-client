import Color from '../../constants/color';

export interface RemotePlayerDTO {
  id: number;
  name: string;
  color: Color;
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
