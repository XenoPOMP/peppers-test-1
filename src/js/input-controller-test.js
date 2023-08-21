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
        keys: [],
        enabled: true
    }
});

consoleGroup('Проверка метода bindActions', () => {
    console.log(controller.actions);

    controller.bindActions({
        right: {
            keys: [],
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

// controller.onInput('KeyW', () => {
//     const arrow = document.querySelector('img#arrowMain');

//     arrow.classList.remove('left', 'bottom', 'right');
// });

// controller.onInput('KeyA', () => {
//     const arrow = document.querySelector('img#arrowMain');
    
//     arrow.classList.remove('left', 'bottom', 'right');
//     arrow.classList.add('left');
// });

// controller.onInput('KeyS', () => {
//     const arrow = document.querySelector('img#arrowMain');
    
//     arrow.classList.remove('left', 'bottom', 'right');
//     arrow.classList.add('bottom');
// });

// controller.onInput('KeyD', () => {
//     const arrow = document.querySelector('img#arrowMain');
    
//     arrow.classList.remove('left', 'bottom', 'right');
//     arrow.classList.add('right');
// });