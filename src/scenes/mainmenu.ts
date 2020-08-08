import * as BABYLON from '@babylonjs/core';

export default class MainMenuScene {
  private element: HTMLDivElement;

  public readonly onPlayerSubmit: BABYLON.Observable<{ name: string; color: string }>;

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

    const redOption = document.createElement('option');
    redOption.innerText = 'Red';
    redOption.value = 'red';
    colorSelect.options.add(redOption);

    const blueOption = document.createElement('option');
    blueOption.innerText = 'Blue';
    blueOption.value = 'blue';
    colorSelect.options.add(blueOption);

    const greenOption = document.createElement('option');
    greenOption.innerText = 'Green';
    greenOption.value = 'green';
    colorSelect.options.add(greenOption);

    const yellowOption = document.createElement('option');
    yellowOption.innerText = 'Yellow';
    yellowOption.value = 'yellow';
    colorSelect.options.add(yellowOption);

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

      this.onPlayerSubmit.notifyObservers({ name: nameInput.value, color: colorSelect.value });
    });

    document.body.appendChild(this.element);
  }

  public dispose(): void {
    this.element.remove();
  }
}
