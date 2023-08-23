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

// TODO: добавить новые виды ввода
class InputObserver {
  /** @param {{manualInit?: boolean, updateType?: 'onTick' | 'always', autodetectDevice?: boolean, initialDevice?: 'keyboard' | 'mouse' | 'gamepad'}} props */
  constructor({
    manualInit,
    updateType = 'always',
    autodetectDevice = true,
    initialDevice = 'keyboard',
  }) {
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

    /** @type {typeof updateType} */
    this.updateType = updateType;
    /** @type {typeof autodetectDevice} */
    this.autodetectDevice = autodetectDevice;

    if (!this.autodetectDevice) {
      this.lastActiveDevice = initialDevice;
    }

    this.init('default');
  }

  init() {
    addEventListener('keydown', event => {
      this.keyboard._buttonsToAdd.push(event.keyCode);

      if (this.updateType === 'always') {
        this.update();
      }
    });

    addEventListener('keyup', event => {
      this.keyboard._buttonsToRemove.push(event.keyCode);

      if (this.updateType === 'always') {
        this.update();
      }
    });
  }

  _processInputDevice(inputDevice) {
    // FIX (потенциально): заменить функцию cloneDeep
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

    if (this.autodetectDevice) {
      this._setLastActiveDevice();
    }
  }
}

class InputController {
  observer = new InputObserver({
    manualInit: false,
    updateType: 'always',
    autodetectDevice: true,
  });

  abortController = new AbortController();

  enabled = false;

  /** @type {Record<string, { keys: number[], enabled?: boolean, onEvent?: () => any, afterEvent?: () => any }>} */
  actions = {};
  /** @type {HTMLElement|Document|Window|null} */
  target = null;

  // КОНСТАНТЫ
  ACTION_ACTIVATED = 'input-controller:action-activated';
  ACTION_DEACTIVATED = 'input-controller:action-deactivated';

  /**
   * @param {typeof InputController.prototype.actions} [actionsToBind]
   * @param {NonNullable<typeof InputController.prototype.target>} [target]
   */
  constructor(actionsToBind, target) {
    if (actionsToBind !== undefined) {
      this.bindActions(actionsToBind);
    }

    if (target !== undefined) {
      this.target = target;
    }

    addEventListener('keydown', () => {
      this.observer.update();

      if (
        this.target !== null &&
        this.target !== undefined &&
        this.isAnyActionActive()
      ) {
        this.target.dispatchEvent(new Event(this.ACTION_ACTIVATED));
      }
    });

    addEventListener('keyup', () => {
      this.observer.update();

      if (
        this.target !== null &&
        this.target !== undefined &&
        !this.isAnyActionActive()
      ) {
        this.target.dispatchEvent(new Event(this.ACTION_DEACTIVATED));
      }
    });
  }

  /** @param {typeof InputController.prototype.actions} actionsToBind */
  bindActions(actionsToBind) {
    this.actions = { ...this.actions, ...actionsToBind };
  }

  /** @param {string} actionName */
  enableAction(actionName) {
    this.actions[actionName].enabled = true;
  }

  /** @param {string} actionName */
  disableAction(actionName) {
    this.actions[actionName].enabled = false;
  }

  /**
   * @param {NonNullable<typeof InputController.prototype.target>} target
   * @param {boolean} [dontEnable]
   */
  attach(target, dontEnable = false) {
    this.enabled = !dontEnable;
    this.target = target;

    this.abortController = new AbortController();

    this.target.addEventListener(this.ACTION_ACTIVATED, () => {
      this.onEvent('keypress');
    });

    this.target.addEventListener(this.ACTION_DEACTIVATED, () => {
      this.onEvent('keyup');
    });
  }

  detach() {
    this.abortController.abort();
    this.target = null;
  }

  /** @param {'keypress'|'keyup'} eventType */
  onEvent(eventType) {
    if (!this.enabled) {
      return;
    }

    const actionNames = Object.keys(this.actions);

    const activeActionsNames = actionNames.filter(name =>
      this.isActionActive(name),
    );

    activeActionsNames.map(activeActionName => {
      const { onEvent, afterEvent } = this.actions[activeActionName];

      switch (eventType) {
        case 'keypress': {
          if (onEvent !== undefined) {
            onEvent();
          }
        }
        case 'keyup': {
          if (afterEvent !== undefined) {
            afterEvent();
          }
        }
      }
    });
  }

  /** @param {string} action */
  isActionActive(action) {
    const targetAction = this.actions[action];
    const actionExists = action in this.actions;

    if (!actionExists) {
      throw new Error(
        `You\`re trying to check action\`s status which doesn\`t exist (${action}).`,
      );
    }

    /**
     * @param {typeof targetAction} action    объект с экшеном.
     */
    const hasActiveKey = action => {
      const { keys } = action;

      return keys.find(key => this.isKeyPressed(key)) !== undefined;
    };

    return actionExists && hasActiveKey(targetAction);
  }

  isAnyActionActive() {
    const actionNames = Object.keys(this.actions);

    const result = actionNames.find(actionName => {
      const targetAction = this.actions[actionName];

      return this.isActionActive(actionName);
    });

    return result !== undefined;
  }

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
