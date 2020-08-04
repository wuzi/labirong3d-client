import KeyCode from '../constants/keycode';

export default class Chatbox {
  private element: HTMLDivElement;

  private readArea: HTMLDivElement;

  private writeArea: HTMLInputElement;

  constructor(
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.element = document.createElement('div');
    this.element.style.display = 'none';
    this.element.id = 'chatbox';
    document.body.appendChild(this.element);

    this.readArea = document.createElement('div');
    this.readArea.classList.add('chatbox__read');
    this.element.appendChild(this.readArea);

    this.writeArea = document.createElement('input');
    this.writeArea.classList.add('chatbox__write');
    this.element.appendChild(this.writeArea);

    this.attachControl();
  }

  public show(): void {
    this.element.style.display = 'flex';
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  public blur(): void {
    this.writeArea.blur();
    this.canvas.focus();
  }

  public focus(): void {
    this.writeArea.focus();
  }

  public appendMessage(message: string, author: string, color = '#ff0000'): void {
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
  }

  private attachControl(): void {
    this.canvas.onkeydown = (e: KeyboardEvent): void => {
      switch (e.keyCode) {
        case KeyCode.ENTER:
          this.focus();
          break;
        default:
          break;
      }
    };

    this.writeArea.onkeydown = (e: KeyboardEvent): void => {
      switch (e.keyCode) {
        case KeyCode.ESCAPE:
        case KeyCode.ENTER:
          this.blur();
          break;
        default:
          break;
      }
    };
  }
}
