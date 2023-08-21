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

controller.attach(document, true);

/** Выводим данные. */
const inlineData = () => {
    /** @type {string} */
    const textToInsert = [
        `Контроллер включен: ${controller.enabled}`,
        '',
        'Actions:', 
        JSON.stringify(controller.actions, null, 2)
    ].join('\n');

    document.querySelector('#info-preview p').innerText = textToInsert;
}

inlineData();

/** @type {Record<string, HTMLButtonElement|null>} */
const devButtons = {
    attachButton: document.querySelector('button#attach-test-button'),
    detachButton: document.querySelector('button#detach-test-button'),
    activateButton: document.querySelector('button#activate-test-button'),
    deactivateButton: document.querySelector('button#deactivate-test-button'),
};

devButtons.attachButton.onclick = () => {
    controller.attach(document.body);
    inlineData();
};

devButtons.detachButton.onclick = () => {
    controller.detach();
    inlineData();
};

devButtons.activateButton.onclick = () => {
    controller.activate();
    inlineData();
}

devButtons.deactivateButton.onclick = () => {
    controller.deactivate();
    inlineData();
}

// consoleGroup('Проверка метода bindActions', () => {
//     console.log(controller.actions);

//     controller.bindActions({
//         right: {
//             keys: [100],
//             enabled: false
//         }
//     });

//     console.log(controller.actions);
// });

// consoleGroup('Проверка метода isActionActive', () => {
//     console.log(`Action[bottom] активно: %c${controller.isActionActive('bottom')}`, 'color: blue;');
//     console.log(`Action[left] активно: %c${controller.isActionActive('left')}`, 'color: blue;');
//     console.log(`Action[right] активно: %c${controller.isActionActive('right')}`, 'color: blue;');
// });

// consoleGroup('Проверка метода enableAction', () => {
//     controller.enableAction('topLeft');
//     controller.enableAction('right');

//     console.log(`Action[right] активно: %c${controller.isActionActive('right')}`, 'color: blue;');
// });

// consoleGroup('Проверка метода disableAction', () => {
//     controller.disableAction('topLeft');
//     controller.disableAction('left');

//     console.log(`Action[left] активно: %c${controller.isActionActive('left')}`, 'color: blue;');

//     controller.enableAction('right');
//     controller.enableAction('left');
// });

// consoleGroup('Проверка метода attach', () => {
//     controller.attach(document);
// });

// consoleGroup('Проверка метода detach', () => {
//     controller.detach();
//     // controller.attach(document);
// });
