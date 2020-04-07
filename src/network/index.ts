import Player from '../player';

export default class Network {
  private connection: WebSocket | undefined;

  public players: Player[];

  constructor(private url: string) {
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

  public getClientId(): Promise<number> {
    return new Promise(((resolve, reject) => {
      if (!this.connection) {
        throw new Error('not connected');
      }

      const eventReq = { name: 'getClientId' };
      this.connection.send(JSON.stringify(eventReq));

      this.connection.onmessage = function (e: MessageEvent): void {
        const eventRes = JSON.parse(e.data);
        if (eventRes.name === 'getClientId') {
          resolve(eventRes.data.id);
        }
      };

      this.connection.onerror = function (err): void {
        reject(err);
      };
    }));
  }
}
