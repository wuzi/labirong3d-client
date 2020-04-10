export default class Network {
  public readonly connection: WebSocket;

  public static readonly STATE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  };

  constructor(private url: string) {
    this.connection = new WebSocket(this.url);
  }

  get readyState(): number {
    return this.connection.readyState;
  }

  public async send(event: string, data?: Record<string, unknown>): Promise<void> {
    const request = { name: event, data };
    this.connection.send(JSON.stringify(request));
  }
}
