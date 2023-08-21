const controller = new InputController({
    left: {
        keys: [],
        enabled: true
    }
});

console.log(controller.actions);

controller.bindActions({
    right: {
        keys: [],
        enabled: false
    }
});

console.log(controller.actions);

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