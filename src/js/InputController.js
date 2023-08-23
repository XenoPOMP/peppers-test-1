const cloneDeep = value => {
  if (typeof value !== 'object' || value == null) {
    return value;
  }

  const result = Array.isArray(value) ? [] : {};

  for (const key in value) {
    result[key] = cloneDeep(value[key]);
  }

  return result;
};

/**
 * @param {Array<any>} array
 * @param {(...args: any[]) => boolean} predicate
 */
const remove = (array, predicate) => {
  let index = -1;
  let length = array === null ? 0 : array.length;
  const result = [];

  while (++index < length) {
    const value = array[index];

    if (predicate(value, index, array)) {
      result.push(value);
      array.slice(index--, 1);
      length--;
    }
  }

  return result;
};

class InputObserver {
  /** @param {{manualInit?: boolean}} props */
  constructor({ manualInit }) {
    this.lastActiveDevice = undefined;

    this.keyboard = {
      _buttonsToAdd: [],
      _buttonsToRemove: [],
      _previouslyPressed: [],
      pressed: [],
      justPressed: [],
    };

    if (manualInit === true && manualInit !== undefined) {
      this.init('default');
      return this;
    }

    this.init('default');
  }

  init() {
    addEventListener('keydown', event => {
      this.keyboard._buttonsToAdd.push(event.keyCode);
    });

    addEventListener('keyup', event => {
      this.keyboard._buttonsToRemove.push(event.keyCode);
    });
  }

  _processInputDevice(inputDevice) {
    inputDevice._previouslyPressed = cloneDeep(inputDevice.pressed);

    inputDevice._buttonsToAdd.forEach(buttonToAdd => {
      if (!inputDevice.pressed.includes(buttonToAdd)) {
        inputDevice.pressed.push(buttonToAdd);
      }
    });

    let removalDelay = [];

    inputDevice._buttonsToRemove.forEach(buttonToRemove => {
      if (!inputDevice._buttonsToAdd.includes(buttonToRemove)) {
        remove(inputDevice.pressed, button => button === buttonToRemove);
      } else {
        removalDelay.push(buttonToRemove);
      }
    });

    inputDevice.justPressed = inputDevice.pressed.filter(
      button => !inputDevice._previouslyPressed.includes(button),
    );

    inputDevice._buttonsToAdd = [];
    inputDevice._buttonsToRemove = [];

    removalDelay.forEach(button => inputDevice._buttonsToRemove.push(button));
  }

  _setLastActiveDevice() {
    if (this.keyboard.justPressed.length > 0) {
      this.lastActiveDevice = 'keyboard';
    }
  }

  update() {
    this._processInputDevice(this.keyboard);

    this._setLastActiveDevice();
  }
}

class InputController {
  observer = new InputObserver({
    manualInit: false,
  });

  constructor() {
    const displayClass = () => {
      document.querySelector('article#info-preview pre p').innerText =
        JSON.stringify(
          {
            justPressed: this.observer.keyboard.justPressed,
            pressed: this.observer.keyboard.pressed,
            _buttonsToAdd: this.observer.keyboard._buttonsToAdd,
            _buttonsToRemove: this.observer.keyboard._buttonsToRemove,
            _previouslyPressed: this.observer.keyboard._previouslyPressed,
            lastActiveDevice: this.observer.keyboard.lastActiveDevice,
          },
          null,
          2,
        );
    };

    addEventListener('keydown', () => {
      this.observer.update();
      displayClass();
    });

    addEventListener('keyup', () => {
      this.observer.update();
      displayClass();
    });
  }
}
