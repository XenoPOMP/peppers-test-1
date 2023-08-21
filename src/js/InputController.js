/**
 * Абстрактный класс, который предоставляет интерфейс для
 * других контроллеров.
 */
class InputController {
    /** @type {boolean} */
    enabled = true;
    /** @type {boolean} */
    focused = true;

    /** @type {string|undefined} */
    ACTION_ACTIVATED = undefined;
    /** @type {string|undefined} */
    ACTION_DEACTIVATED = undefined;

    /** @type {Record<string, { keys: number[], enabled?: boolean }>} */
    actions = {};

    /** @type {HTMLElement|Document|null} */
    target = null;

    /** @type {number | undefined} */
    _CURRENT_PRESSED_KEY = undefined;

    /** @type {AbortController} */
    _ABORT_CONTROLLER = new AbortController();

    /**
     * @param {Record<string, { keys: number[], enabled?: boolean }>} actionsToBind         события, которые нужно забиндить.
     * @param {HTMLElement|Document} [target]                                               цель, на которую будут свешиваться слушатели событий
     *                                                                                      (**null**) по умолчанию.
     */
    constructor(actionsToBind, target) {
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
        document.addEventListener('keypress', (ev) => {
            const { keyCode } = ev;

            this._CURRENT_PRESSED_KEY = keyCode;
        });
    }

    /**
     * Этот метод занимается биндингом событий.
     * 
     * @param {Record<string, { keys: number[], enabled?: boolean }>} actionsToBind        события, которые нужно забиндить.
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

        return this.actions[action].enabled ?? false;
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
     * @param {HTMLElement|Document} target     цель, на которую вешается слушатель событий.
     * @param {boolean} dontEnable                   если передано **true** - не активирует контроллер.
     */
    attach(target, dontEnable) {
        if (dontEnable || target === null) {
            return;
        }

        this.target = target;
        this.target.addEventListener('keypress', () => this.onEvent(), {
            signal: this._ABORT_CONTROLLER.signal
        });
    }

    /**
     * Этот метод снимает слушатель событий с цели.
     */
    detach() {
        // this._ABORT_CONTROLLER.abort();

        this.target.removeEventListener('keypress', () => this.onEvent(), {
            signal: this._ABORT_CONTROLLER.signal
        });
    }

    /**
     * Этот метод проверяет, нажата ли нужная кнопка.
     * 
     * @param {number} keyCode     проверяемый код кнопки.
     * 
     * @returns {boolean}
     */
    isKeyPressed(keyCode) {
        if (this._CURRENT_PRESSED_KEY === undefined) {
            return false;
        }

        return this._CURRENT_PRESSED_KEY === keyCode;
    }

    /**
     * Метод, обрабатывающий событие, возникающее при
     * инпуте.
     */
    onEvent() {
        /** Пробегаемся циклом по всем экшенам, проверяем нажатие нужной кнопки. */
        Object.keys(this.actions).forEach(actionName => {
            const { keys, enabled } = this.actions[actionName];

            /** Если событие включено, то выполняем некий колбэк. */
            if (enabled ?? false) {
                keys.forEach(key => {
                    if (this.isKeyPressed(key)) {
                        /** Сюда нужно вставить */
                        console.log(`Вызвано событие {${actionName}} посредством нажатия на кнопку [${key}]`);
                    }
                })
            }
        });
    }

    // TODO =============
    // bindActions      +
    // enableAction     +
    // disableAction    +
    // attach           +
    // detach           
    // isActionActive   +
    // isKeyPressed     +
}