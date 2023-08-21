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

    /** @type {number | undefined} */
    _CURRENT_PRESSED_KEY = undefined;

    /**
     * @param {Record<string, { keys: number[], enabled?: boolean }>} actionsToBind         события, которые нужно забиндить.
     * @param {HTMLElement} [target]                                                        цель, на которую будут свешиваться слушатели событий
     *                                                                                      (**document**) по умолчанию.
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
     * @param {HTMLElement|Document|null} target     цель, на которую вешается слушатель событий.
     * @param {boolean} dontEnable              если передано **true** - не активирует контроллер.
     */
    attach(target, dontEnable) {
        if (dontEnable || target === null) {
            return;
        }

        target.addEventListener('keypress', () => {
            console.log(`Нажата кнопка с кодом 97 (A): %c${this.isKeyPressed(97)}`, 'color: blue;');
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
     * 
     * @param {string} key       код нажатой кнопки.    
     * @param {() => any} action            колбэк, вызываемый в момент нажатия. 
     */
    onInput(key, action) {
        /** Вешаем на цель обработчик событий keypress. */
        this.target.addEventListener('keypress', (ev) => {
            /** 
             * Если кнопка из события совпадает с целевой,
             * выполняем колбэк.
             */
            if (ev.code === key) {
                action();
            }
        });
    }

    // TODO =============
    // bindActions      +
    // enableAction     +
    // disableAction    +
    // attach           
    // detach           
    // isActionActive   +
    // isKeyPressed     
}