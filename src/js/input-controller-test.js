/**
 * @param {string} groupName 
 * @param {() => any} callback 
 */
const consoleGroup = (groupName, callback) => {
    console.group(groupName);
    callback();
    console.groupEnd();
}

/** Объект игрока. */
const reqSquare = document.querySelector('#redSquare');

const controller = new InputController({
    left: {
        keys: [97],
        enabled: true,
        callback: () => {
            
        }
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
    bindJumpButton: document.querySelector('button#bind-jump-test-button'),
};

devButtons.attachButton.onclick = () => {
    controller.attach(document);
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

devButtons.bindJumpButton.onclick = () => {
    controller.bindActions({
        jump: {
            keys: [32],
            enabled: true
        }
    });
    inlineData();
}