import * as BABYLON from '@babylonjs/core';
import Color from '../constants/color';

export default class MainMenuScene {
  private element: HTMLDivElement;

  public readonly onPlayerSubmit: BABYLON.Observable<{ name: string; color: Color }>;

  constructor() {
    this.onPlayerSubmit = new BABYLON.Observable();

    this.element = document.createElement('div');
    this.element.id = 'mainmenu';

    const form = document.createElement('form');
    form.classList.add('mainmenu__form');
    this.element.appendChild(form);

    const title = document.createElement('h2');
    title.innerText = 'Welcome to Labirong 3D!';
    form.appendChild(title);

    const body = document.createElement('div');
    form.appendChild(body);

    const nameInput = document.createElement('input');
    nameInput.placeholder = 'Type your name';
    body.appendChild(nameInput);

    const colorSelect = document.createElement('select');
    body.appendChild(colorSelect);

    const colors = Object.values(Color);
    colors.forEach((color) => {
      const option = document.createElement('option');
      option.innerText = color;
      option.value = color;
      colorSelect.options.add(option);
    });

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.innerText = 'Play';
    body.appendChild(playButton);

    const errorMessage = document.createElement('p');
    errorMessage.classList.add('error__message');
    body.appendChild(errorMessage);

    playButton.addEventListener('click', () => {
      if (nameInput.value.length < 3) {
        errorMessage.innerText = 'Name too short!';
        return;
      }

      if (nameInput.value.length > 12) {
        errorMessage.innerText = 'Name too long!';
        return;
      }

      this.onPlayerSubmit.notifyObservers({
        name: nameInput.value,
        color: colorSelect.value as Color,
      });
    });

    document.body.appendChild(this.element);
  }

  public dispose(): void {
    this.element.remove();
  }
}
