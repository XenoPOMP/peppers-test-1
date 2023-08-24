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

/**
 * @param {any[]} arrayOne
 * @param {any[]} arrayTwo
 *
 * @returns {boolean}
 */
const arraysEqual = (arrayOne, arrayTwo) => {
  const bothAreArrays = Array.isArray(arrayOne) && Array.isArray(arrayTwo);
  const lengthsAreEqual = arrayOne.length === arrayTwo.length;
  const itemsAreTheSame = arrayOne.every(
    (val, index) => val === arrayTwo[index],
  );

  return bothAreArrays && lengthsAreEqual && itemsAreTheSame;
};

class InputObserver {
  /** @param {{manualInit?: boolean, updateType?: 'onTick' | 'always', autodetectDevice?: boolean, initialDevice?: string}} props */
  constructor({
    manualInit,
    updateType = 'always',
    autodetectDevice = true,
    initialDevice = 'keyboard',
  }) {
    this.lastActiveDevice = undefined;

    this.gamepad = {
      buttonMap: [
        'A',
        'B',
        'X',
        'Y',
        'LB',
        'RB',
        'LT',
        'RT',
        'Start',
        'Menu',
        'LS',
        'RS',
        'Up',
        'Down',
        'Left',
        'Right',
      ],
      _previouslyPressed: [],
      pressed: [],
      justPressed: [],

      _previouslyConnected: false,
      connected: false,
      justConnected: false,
      justDisconnected: false,

      axes: [0, 0, 0, 0],
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

  updateObserver() {
    {
      if (this.updateType === 'always') {
        this.update();
      }
    }
  }

  init() {
    // Отслеживание подключения и отключения геймпада
    addEventListener('gamepadconnected', () => {
      this.gamepad.connected = true;
      this.updateObserver();
    });

    addEventListener('gamepaddisconnected', () => {
      this.gamepad.connected = false;
      this.updateObserver();
    });
  }

  /**
   * @param {ObserverPlugin[]} [plugins]
   * @param {{activation: () => any, deactivation: () => any}} [actions]
   */
  initPlugins(plugins, actions) {
    if (plugins?.length === 0 || plugins === undefined) {
      console.log('Didn`t found any plugin.');
      return;
    }

    plugins.forEach(plugin => {
      plugin.init(actions);

      this[plugin.name] = {
        _buttonsToAdd: [],
        _buttonsToRemove: [],
        _previouslyPressed: [],
        pressed: [],
        justPressed: [],
      };
    });

    this.plugins = plugins;

    console.log(this);
  }

  _processInputDevice(inputDevice) {
    inputDevice._previouslyPressed = [...(inputDevice.pressed ?? [])];

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

  _processGamepad() {
    const gamepads = navigator.getGamepads();

    const firstGamepad = gamepads[0];

    if (firstGamepad !== null) {
      /** @returns {{declaration: GamepadButton, index: number}[]} */
      const buttons = firstGamepad.buttons.map((button, i) => {
        return {
          declaration: button,
          index: i,
        };
      });

      const pressedButtons = buttons.filter(
        button => button.declaration.pressed,
      );

      this.gamepad._previouslyPressed = cloneDeep(this.gamepad.pressed);
      this.gamepad.pressed = [];

      pressedButtons.forEach(pressedButton => {
        const { declaration, index } = pressedButton;

        const buttonName = this.gamepad.buttonMap[index];
        this.gamepad.pressed.push(buttonName);
      });

      this.gamepad.justPressed = this.gamepad.pressed.filter(
        button => !this.gamepad._previouslyPressed.includes(button),
      );
      this.gamepad.axes = firstGamepad.axes;
    }
  }

  _processGamepadConnection() {
    // Определяем, был ли геймпад подключен только что
    if (this.gamepad.connected && !this.gamepad._previouslyConnected) {
      this.gamepad.justConnected = true;
    } else {
      this.gamepad.justConnected = false;
    }

    // Определяем, был ли геймпад отключен только что
    if (!this.gamepad.connected && this.gamepad._previouslyConnected) {
      this.gamepad.justDisconnected = true;
    } else {
      this.gamepad.justDisconnected = false;
    }

    // Запоминаем статус подключения в переменной _previouslyConnected
    this.gamepad._previouslyConnected = this.gamepad.connected;
  }

  _setLastActiveDevice() {
    if (this.keyboard.justPressed.length > 0) {
      this.lastActiveDevice = 'keyboard';
    }

    if (this.mouse.justPressed.length > 0) {
      this.lastActiveDevice = 'mouse';
    }

    if (this.plugins !== undefined) {
      const deviceNames = this.plugins.map(plugin => plugin.name);

      deviceNames.forEach(name => {
        const isJustPressed = this[name].justPressed.length > 0;

        if (isJustPressed) {
          this.lastActiveDevice = name;
        }
      });
    }

    if (!this.gamepad.connected) return;

    let axesActive = false;

    this.gamepad.axes.forEach(axis => {
      if (Math.abs(axis) > 0.15) axesActive = true;
    });

    if (this.gamepad.justPressed.length > 0 || axesActive) {
      this.lastActiveDevice = 'gamepad';
    }
  }

  update() {
    this.plugins?.map(plugin => {
      this._processInputDevice(this[plugin.name]);
    });

    this._processGamepadConnection();

    if (this.gamepad.connected) {
      this._processGamepad();
    }

    if (this.autodetectDevice) {
      this._setLastActiveDevice();
    }
  }
}

/**
 * Этот класс предоставляет интерфейс для создание плагинов для Observer.
 * 
 * Пример кастомного плагина:
 * @example
 * class MousePlugin extends ObserverPlugin {
  constructor(observer) {
    super({
      name: 'mouse',                  // Имя плагина. Запоминается в памяти Observer как имя устройства.
      observer,                       // Необходимо ОБЯЗАТЕЛЬНО передать экземпляр класса Observer.
      eventTypes: {                   // Строковые названия всех отслеживаемых событий
        onButtonPress: 'mousedown',   // |= Название события, которое происходит при нажатии клавиши (у клавиатуры - keydown, у мыши - mousedown)
        onButtonUp: 'mouseup',        // |= Название события, которое происходит при отжатии клавиши (у клавиатуры - keyup, у мыши - mouseup)
        keyCodeName: 'button',        // |= Плагин генерит слушатель событий (addEventListener), в который передается callback с event. Нужно
                                      // |  указать, какой ключ из объекта event нужно взять для того, чтобы получить keyCode в формате int.
      },
    });
  }
}
 */
class ObserverPlugin {
  /** @type {{ onButtonPress: string, onButtonUp: string, keyCodeName: string }} */
  eventTypes = {
    onButtonPress: 'keydown',
    onButtonUp: 'keyup',
    keyCodeName: 'keyCode',
  };

  /**
   * @param {{name: PropertyKey, observer: InputObserver, eventTypes: { onButtonPress: string, onButtonUp: string, keyCodeName: string }}} props
   */
  constructor(props) {
    const { name, observer, eventTypes } = props;

    /** @type {string} */
    this.name = name;
    /** @type {InputObserver} */
    this.observer = observer;
    /** @type {typeof eventTypes} */
    this.eventTypes = eventTypes;
  }

  /**
   * Этот метод будет вызываться при нажатии на кнопку.
   *
   * Сюда нужно поместить логику нажатия.
   * @param {{activation: () => any, deactivation: () => any}} [actions]
   */
  init(actions) {
    addEventListener(this.eventTypes?.onButtonPress ?? '', event => {
      const { _previouslyPressed, pressed } = this.observer[this.name];

      actions?.activation();

      this.observer[this.name]._buttonsToAdd.push(
        event[this.eventTypes.keyCodeName],
      );

      this.observer.updateObserver();
    });

    addEventListener(this.eventTypes?.onButtonUp ?? '', event => {
      // actions?.deactivation();

      this.observer[this.name]._buttonsToRemove.push(event.keyCode);
      this.observer.updateObserver();

      actions?.deactivation();
    });
  }
}

class KeyboardPlugin extends ObserverPlugin {
  /** @param {InputObserver} observer */
  constructor(observer) {
    super({
      name: 'keyboard',
      observer,
      eventTypes: {
        onButtonPress: 'keydown',
        onButtonUp: 'keyup',
        keyCodeName: 'keyCode',
      },
    });
  }
}

class MousePlugin extends ObserverPlugin {
  /** @param {InputObserver} observer */
  constructor(observer) {
    super({
      name: 'mouse',
      observer,
      eventTypes: {
        onButtonPress: 'mousedown',
        onButtonUp: 'mouseup',
        keyCodeName: 'button',
      },
    });
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
  /** @type {ObserverPlugin[]} */
  PLUGIN_LIST = [
    new KeyboardPlugin(this.observer),
    new MousePlugin(this.observer),
  ];

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

    const activateAction = () => {
      // this.observer.update();

      if (
        this.target !== null &&
        this.target !== undefined &&
        !this.isAnyActionActive()
      ) {
        this.target.dispatchEvent(new Event(this.ACTION_ACTIVATED));
      }
    };

    const deactivateAction = () => {
      // this.observer.update();

      if (
        this.target !== null &&
        this.target !== undefined &&
        this.isAnyActionActive()
      ) {
        this.target.dispatchEvent(new Event(this.ACTION_DEACTIVATED));
      }
    };

    // ИНИЦИАЛИЗАЦИЯ ПЛАГИНОВ
    this.observer.initPlugins(this.PLUGIN_LIST, {
      activation: activateAction,
      deactivation: deactivateAction,
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
      console.log('Event activated.');

      this.onEvent('keypress');
    });

    this.target.addEventListener(this.ACTION_DEACTIVATED, () => {
      console.log('Event deactivated.');

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

          break;
        }
        case 'keyup': {
          if (afterEvent !== undefined) {
            afterEvent();
          }

          break;
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
