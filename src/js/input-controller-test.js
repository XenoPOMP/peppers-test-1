/**
 * @param {string} groupName 
 * @param {() => any} callback 
 */
const consoleGroup = (groupName, callback) => {
    console.group(groupName);
    callback();
    console.groupEnd();
}

const controller = new InputController({
    left: {
        keys: [97],
        enabled: true
    }
});

const stopEventListening = () => {
    controller.detach();
}

consoleGroup('Проверка метода bindActions', () => {
    console.log(controller.actions);

    controller.bindActions({
        right: {
            keys: [100],
            enabled: false
        }
    });

    console.log(controller.actions);
});

consoleGroup('Проверка метода isActionActive', () => {
    console.log(`Action[bottom] активно: %c${controller.isActionActive('bottom')}`, 'color: blue;');
    console.log(`Action[left] активно: %c${controller.isActionActive('left')}`, 'color: blue;');
    console.log(`Action[right] активно: %c${controller.isActionActive('right')}`, 'color: blue;');
});

consoleGroup('Проверка метода enableAction', () => {
    controller.enableAction('topLeft');
    controller.enableAction('right');

    console.log(`Action[right] активно: %c${controller.isActionActive('right')}`, 'color: blue;');
});

consoleGroup('Проверка метода disableAction', () => {
    controller.disableAction('topLeft');
    controller.disableAction('left');

    console.log(`Action[left] активно: %c${controller.isActionActive('left')}`, 'color: blue;');

    controller.enableAction('right');
    controller.enableAction('left');
});

consoleGroup('Проверка метода attach', () => {
    controller.attach(document);
});

consoleGroup('Проверка метода detach', () => {
    // controller.detach();
    // controller.attach(document);
});
