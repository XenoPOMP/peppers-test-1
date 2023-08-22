/**
 * Абстрактный класс, который предоставляет интерфейс для
 * других контроллеров.
 */
class InputController extends EventTarget {
  /** @type {boolean} */
  enabled = true;
  /** @type {boolean} */
  focused = true;

  /** @type {string|undefined} */
  ACTION_ACTIVATED = undefined;
  /** @type {string|undefined} */
  ACTION_DEACTIVATED = undefined;

  /** @type {Record<string, { keys: number[], enabled?: boolean, activate?: () => any, deactivate?: () => any }>} */
  actions = {};

  /** @type {HTMLElement|Document|null} */
  target = null;

  /** @type {number} */
  _MAX_INPUTS_AT_THE_MOMENT_COUNT = 10;

  /** @type {number[]} */
  _CURRENT_PRESSED_KEYS_HEAP = [];

  /** @type {AbortController} */
  _ABORT_CONTROLLER = new AbortController();

  /** @type {Event} */
  activate = new Event('activate', {
    bubbles: true,
    cancelable: false,
  });
  /** @type {Event} */
  deactivate = new Event('deactivate', {
    bubbles: true,
    cancelable: false,
  });

  /**
   * @param {Record<string, { keys: number[], enabled?: boolean, activate?: () => any, deactivate?: () => any }>} actionsToBind         события, которые нужно забиндить.
   * @param {HTMLElement|Document} [target]                                                                                             цель, на которую будут свешиваться слушатели событий
   *                                                                                                                                    (**null**) по умолчанию.
   */
  constructor(actionsToBind, target) {
    super();

    /**
     * Присваиваем переменной target значение из аргумента,
     * есди таковое имеется.
     */
    if (target !== undefined) {
      this.target = target;
    }

    /** Если в конструктор были переданы события, то биндим их. */
    if (actionsToBind !== undefined) {
      this.bindActions(actionsToBind);
    }

    /** Отслеживаем любые нажатия, запоминаем код кнопки. */
    document.addEventListener('keydown', ev => {
      const { keyCode } = ev;

      this.dispatchEvent(this.activate);

      if (keyCode !== this._CURRENT_PRESSED_KEYS_HEAP.at(0)) {
        /** Добавляем нажатую кнопку в начало кучи. */
        this._CURRENT_PRESSED_KEYS_HEAP.unshift(keyCode);
      }

      /** Если куча переполнена, то */
      if (
        this._CURRENT_PRESSED_KEYS_HEAP.length >
        this._MAX_INPUTS_AT_THE_MOMENT_COUNT
      ) {
        this._CURRENT_PRESSED_KEYS_HEAP = this._CURRENT_PRESSED_KEYS_HEAP.slice(
          0,
          this._CURRENT_PRESSED_KEYS_HEAP.length - 1
        );
      }
    });

    document.addEventListener('keyup', () => {
      /** Вызываем событие deactivate */
      this.dispatchEvent(this.deactivate);
    });

    this.addEventListener('activate', ev => {
      // console.log('Emitting [activate event]');
      // console.log(ev);
    });

    this.addEventListener('deactivate', ev => {
      // console.log('Emitting [deactivate event]');
      // console.log(ev);
    });
  }

  /** Этот метод позволяет включать контроллер. */
  activateController() {
    this.enabled = true;
  }

  /** Этот метод позволяет выключать контроллер. */
  deactivateController() {
    this.enabled = false;
  }

  /**
   * Этот метод занимается биндингом событий.
   *
   * @param {Record<string, { keys: number[], enabled?: boolean, activate?: () => any, deactivate?: () => any }>} actionsToBind        события, которые нужно забиндить.
   */
  bindActions(actionsToBind) {
    /**
     * Разворачиваем объект с новыми экшенами
     * в переменную actions.
     */
    this.actions = { ...this.actions, ...actionsToBind };
  }

  /**
   * Этот метод включает событие если:
   *
   * 1. Оно существует
   * 2. Оно выключено
   *
   * @param {string} actionName     название события, которое нужно выключить.
   */
  enableAction(actionName) {
    if (this.isActionActive(actionName) || !this.isActionExist(actionName)) {
      return;
    }

    this.actions[actionName].enabled = true;
  }

  /**
   * Этот метод выключает событие если:
   *
   * 1. Оно существует
   * 2. Оно включено
   *
   * @param {string} actionName     название события, которое нужно выключить.
   */
  disableAction(actionName) {
    if (!this.isActionActive(actionName) || !this.isActionExist(actionName)) {
      return;
    }

    this.actions[actionName].enabled = false;
  }

  /**
   * Данный метод проверяет, включено ли событие.
   *
   * @param {string} action           название события, которое нужно проверить.
   *
   * @returns {boolean}
   */
  isActionActive(action) {
    if (!this.isActionExist(action)) {
      console.warn(`Событие [${action}] не существует!`);
      return false;
    }

    /**
     * Проверяем, что какая-нибудь кнопка из
     * события нажата.
     *
     * @type {boolean}
     */
    const isAnyKeyPressed = this.actions[action].keys
      .map(key => this.isKeyPressed(key))
      .includes(true);

    return (this.actions[action].enabled ?? false) && isAnyKeyPressed;
  }

  /**
   * Данный метод проверяет, существует ли событие.
   *
   * @param {string} action           название события, которое нужно проверить.
   *
   * @returns {boolean}
   */
  isActionExist(action) {
    return action in this.actions;
  }

  /**
   * Этот метод вешает на цель слушатель событий, который обрабатывает
   * события из переменной **actions**.
   *
   * @param {HTMLElement|Document} target          цель, на которую вешается слушатель событий.
   * @param {boolean} dontEnable                   если передано **true** - не активирует контроллер.
   */
  attach(target, dontEnable) {
    /** Проверяем, что цель задана и агрумент dontEnable === true */
    if (dontEnable || target === null) {
      this.enabled = dontEnable ?? false;
      return;
    }

    /**
     * Создаем новый AbortController каждый раз,
     * когда происходит событие **attach**.
     */
    this._ABORT_CONTROLLER = new AbortController();

    /** Записываем в переменную цели новую цель. */
    this.target = target;

    this.addEventListener('activate', () => {
      /** Вешаем на новую цель слушатель событий. */
      this.target.addEventListener(
        'keypress',
        () => {
          this.onEvent();
        },
        {
          signal: this._ABORT_CONTROLLER.signal,
        }
      );
      this.target.addEventListener(
        'keyup',
        () => {
          this.afterEvent();

          /** Очищаем очередь кнопок. */
          this._CURRENT_PRESSED_KEYS_HEAP = [];
        },
        {
          signal: this._ABORT_CONTROLLER.signal,
        }
      );
    });
  }

  /**
   * Этот метод снимает слушатель событий с цели.
   */
  detach() {
    /** Посылаем сигнал **abort** в **ABORT_CONTROLLER**. */
    this._ABORT_CONTROLLER.abort();
    /** Сбрасываем цель. */
    this.target = null;
  }

  /**
   * Этот метод проверяет, нажата ли нужная кнопка.
   *
   * @param {number} keyCode     проверяемый код кнопки.
   *
   * @returns {boolean}
   */
  isKeyPressed(keyCode) {
    if (this._CURRENT_PRESSED_KEYS_HEAP.length === 0) {
      return false;
    }

    return this._CURRENT_PRESSED_KEYS_HEAP.includes(keyCode);
  }

  /**
   * Метод, обрабатывающий событие, возникающее при
   * инпуте.
   */
  onEvent() {
    /** Если контроллер отключен, то ничего не делаем. */
    if (!this.enabled) {
      return;
    }

    /** Пробегаемся циклом по всем экшенам, проверяем нажатие нужной кнопки. */
    Object.keys(this.actions).forEach(actionName => {
      const { keys, enabled, activate } = this.actions[actionName];

      /**
       * Если событие включено, то выполняем некий колбэк.
       */
      if (enabled ?? false) {
        keys.forEach(key => {
          if (this.isKeyPressed(key)) {
            /** Сюда нужно вставить колбэк. */
            console.log(
              `Вызвано событие {${actionName}} посредством нажатия на кнопку [${key}]`
            );

            if (activate !== undefined) {
              activate();
            }
          }
        });
      }
    });
  }

  /**
   * Этот метод срабатывает при окончании события.
   */
  afterEvent() {
    /** Если контроллер отключен, то ничего не делаем. */
    if (!this.enabled) {
      return;
    }

    /** Пробегаемся циклом по всем экшенам, проверяем нажатие нужной кнопки. */
    Object.keys(this.actions).forEach(actionName => {
      const { keys, enabled, deactivate } = this.actions[actionName];

      /**
       * Если событие включено, то выполняем некий колбэк.
       */
      if (enabled ?? false) {
        keys.forEach(key => {
          if (this.isKeyPressed(key)) {
            /** Сюда нужно вставить колбэк. */
            console.log(`Событие {${actionName}} отработало.`);

            if (deactivate !== undefined) {
              deactivate();
            }
          }
        });
      }
    });
  }

  // TODO ==============================
  // Fix isActionActive                +
  // Fix  Action name transfer to DOM  -
}
