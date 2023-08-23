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
        inputDevice.pressed = remove(
          inputDevice.pressed,
          button => button === buttonToRemove,
        );
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

  abortController = new AbortController();

  enabled = false;

  /** @type {Record<string, { keys: number[], enabled?: boolean }>} */
  actions = {};
  /** @type {HTMLElement|Document|Window|null} */
  target = null;

  /**
   *
   * @param {Record<string, { keys: number[], enabled?: boolean }>} [actionsToBind]
   * @param {HTMLElement|Document|Window} [target]
   */
  constructor(actionsToBind, target) {
    if (actionsToBind !== undefined) {
      this.bindActions();
    }

    if (target !== undefined) {
      this.target = target;
    }

    addEventListener('keydown', () => {
      this.observer.update();
    });

    addEventListener('keyup', () => {
      this.observer.update();
    });
  }

  // DONE: реализовать bindActions
  bindActions(actionsToBind) {
    this.actions = { ...this.actions, ...actionsToBind };
  }

  // DONE: реализовать enableAction
  enableAction(actionName) {
    this.actions[actionName].enabled = true;
  }

  // DONE: реализовать disableAction
  disableAction(actionName) {
    this.actions[actionName].enabled = false;
  }

  // TODO: реализовать attach
  /**
   *
   * @param {HTMLElement|Document|Window} target
   * @param {boolean} [dontEbable]
   */
  attach(target, dontEbable = false) {
    this.enabled = !dontEbable;
    this.target = target;

    this.abortController = new AbortController();
  }

  // DONE: реализовать detach
  detach() {
    this.abortController.abort();
    this.target = null;
  }

  // TODO: реализовать isActionActive
  /** @param {string} action */
  isActionActive(action) {
    const actionExists = action in this.actions;

    if (!actionExists) {
      throw new Error(
        `You\`re trying to check action\`s status which doesn\`t exist (${action}).`,
      );
    }
  }

  // DONE: реализовать isKeyPressed
  /**
   * @param {number} keyCode
   *
   * @returns {boolean}
   */
  isKeyPressed(keyCode) {
    const currentDevice = this.observer.lastActiveDevice ?? 'keyboard';

    return this.observer[currentDevice].pressed.includes(keyCode);
  }
}
