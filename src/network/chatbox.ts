import Network from './index';
import KeyCode from '../constants/keycode';

export default class Chatbox {
  private element: HTMLDivElement;

  private readArea: HTMLDivElement;

  private writeArea: HTMLInputElement;

  private hideTimeout: NodeJS.Timeout | undefined;

  public static readonly MAX_INPUT_LENGTH = 144;

  public static readonly HIDE_AFTER = 10000;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly network: Network,
  ) {
    this.element = document.createElement('div');
    this.element.style.opacity = '0';
    this.element.id = 'chatbox';
    document.body.appendChild(this.element);

    this.readArea = document.createElement('div');
    this.readArea.classList.add('chatbox__read');
    this.element.appendChild(this.readArea);

    this.writeArea = document.createElement('input');
    this.writeArea.classList.add('chatbox__write');
    this.writeArea.maxLength = Chatbox.MAX_INPUT_LENGTH;
    this.element.appendChild(this.writeArea);

    this.network.onChatMessage.add((data): void => {
      this.appendMessage(data.message, data.player.name, data.player.color);
    });

    this.attachControl();
  }

  public show(): void {
    this.element.style.opacity = '1';
    this.runHideTimeout();
  }

  public hide(delay = true): void {
    if (delay) {
      this.element.style.opacity = '0';
    }
    this.runHideTimeout();
  }

  public blur(): void {
    this.writeArea.blur();
    this.canvas.focus();
  }

  public focus(): void {
    this.writeArea.focus();
  }

  public appendMessage(message: string, author = 'System', color = 'crimson'): void {
    const authorEl = document.createElement('span');
    const containerEl = document.createElement('div');
    const backgroundEl = document.createElement('span');

    authorEl.style.color = color;
    authorEl.textContent = `${author}:`;
    backgroundEl.textContent = message;

    authorEl.classList.add('chatbox__read__author');
    containerEl.classList.add('chatbox__read__container');
    backgroundEl.classList.add('chatbox__read__message');

    containerEl.appendChild(authorEl);
    containerEl.appendChild(backgroundEl);

    this.readArea.appendChild(containerEl);
    this.readArea.scrollTop = this.readArea.scrollHeight;

    this.show();
  }

  private sendMessage(message: string): void {
    this.network.send('chatMessage', { message });
  }

  private attachControl(): void {
    this.canvas.onkeydown = (e: KeyboardEvent): void => {
      switch (e.keyCode) {
        case KeyCode.ENTER:
          this.focus();
          this.show();
          break;
        default:
          break;
      }
    };

    this.writeArea.onkeydown = (e: KeyboardEvent): void => {
      switch (e.keyCode) {
        case KeyCode.ESCAPE:
          this.blur();
          this.hide();
          break;
        case KeyCode.ENTER:
          if (/\S/.test(this.writeArea.value)) {
            this.sendMessage(this.writeArea.value);
          }
          this.writeArea.value = '';
          this.blur();
          this.hide();
          break;
        default:
          break;
      }
    };
  }

  private runHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    if (this.writeArea === document.activeElement) {
      return;
    }

    this.hideTimeout = setTimeout(() => {
      this.element.style.opacity = '0';
      this.hideTimeout = undefined;
    }, Chatbox.HIDE_AFTER);
  }
}
