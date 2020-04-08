import * as BABYLON from '@babylonjs/core';
import Player from '../player';
import Game from '../game';

export default class Network {
  private connection: WebSocket | undefined;

  public players: Player[];

  constructor(private url: string, private game: Game, private localPlayer: Player) {
    this.players = [];
  }

  public connect(): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.connection = new WebSocket(this.url);

      this.connection.onopen = function (): void {
        resolve(undefined);
      };

      this.connection.onerror = function (err): void {
        reject(err);
      };
    }));
  }

  public syncPlayers(): Promise<void> {
    return new Promise(((resolve, reject) => {
      if (!this.connection) {
        throw new Error('not connected');
      }

      const eventReq = { name: 'getServerInfo' };
      this.connection.send(JSON.stringify(eventReq));

      this.connection.onmessage = (e: MessageEvent): void => {
        const eventRes = JSON.parse(e.data);
        if (eventRes.name === 'getServerInfo') {
          this.localPlayer.id = eventRes.data.id;

          eventRes.data.players.forEach((p: { id: number }) => {
            if (p.id === this.localPlayer.id) return;
            this.addPlayer(p.id);
          });

          resolve(undefined);
        }
      };

      this.connection.onerror = function (err): void {
        reject(err);
      };
    }));
  }

  private async addPlayer(id: number): Promise<void> {
    const { meshes, skeletons } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', this.game.scene);
    const player = new Player(this.game.scene, meshes, skeletons);

    player.id = id;
    this.players.push(player);
  }

  public listen(): void {
    if (!this.connection) {
      throw new Error('not connected');
    }

    this.connection.onmessage = async (e: MessageEvent): Promise<void> => {
      if (!this.connection) {
        throw new Error('not connected');
      }

      const eventRes: {
        name: string;
        data: EventResponsePlayer | EventResponsePlayer[];
      } = JSON.parse(e.data);

      if (eventRes.name === 'update') {
        // Update connected players position
        (eventRes.data as EventResponsePlayer[]).forEach((p) => {
          if (p.id === this.localPlayer.id) return;

          const player = this.players.find((pl) => pl.id === p.id);
          if (player) {
            player.position.x = p.position.x;
            player.position.y = p.position.y;
            player.position.z = p.position.z;

            player.rotation.x = p.rotation.x;
            player.rotation.y = p.rotation.y;
            player.rotation.z = p.rotation.z;
          }
        });

        // Send local player position to server
        const eventReq = {
          name: 'movePlayer',
          data: {
            position: {
              x: this.localPlayer.position.x,
              y: this.localPlayer.position.y,
              z: this.localPlayer.position.z,
            },
            rotation: {
              x: this.localPlayer.rotation.x,
              y: this.localPlayer.rotation.y,
              z: this.localPlayer.rotation.z,
            },
          },
        };
        this.connection.send(JSON.stringify(eventReq));
      } else if (eventRes.name === 'playerJoin') {
        this.addPlayer((eventRes.data as EventResponsePlayer).id);
      } else if (eventRes.name === 'playerQuit') {
        const player = this.players.find((p) => p.id === (eventRes.data as EventResponsePlayer).id);
        if (!player) {
          return;
        }

        this.players.splice(this.players.indexOf(player), 1);
        player.mesh.dispose();
      }
    };
  }
}
