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
     * @param {Record<string, { keys: number[], enabled?: boolean }>} actionsToBind 
     * @param {HTMLElement} [target] 
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
     * @param {Record<string, { keys: number[], enabled?: boolean }>} actionsToBind 
     */
    bindActions(actionsToBind) {
        /** 
         * Разворачиваем объект с новыми экшенами
         * в переменную actions.
         */
        this.actions = { ...this.actions, ...actionsToBind };
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
}