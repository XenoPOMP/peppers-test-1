/**
 * Абстрактный класс, который предоставляет интерфейс для
 * других контроллеров.
 */
class InputController {
    constructor() {}

    /**
     * Метод, обрабатывающий событие, возникающее при
     * инпуте.
     * 
     * @param {KeyboardEvent.key} key       код нажатой кнопки.    
     * @param {() => any} action            колбэк, вызываемый в момент нажатия. 
     */
    onInput(key, action) {
        /** Вешаем на документ обработчик событий keypress. */
        document.addEventListener('keypress', (ev) => {
            // console.log(ev);

            /** 
             * Если кнопка из события совпадает с целевой,
             * выполняем колбэк.
             */
            if (ev.key === key) {
                action();
            }
        });
    }
}