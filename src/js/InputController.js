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

    /** @type {HTMLElement|Document} */
    target = document;

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
    // disableAction    
    // attach           
    // detach           
    // isActionActive   +
    // isKeyPressed     
}