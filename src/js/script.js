const controller = new InputController();

controller.onInput('KeyW', () => {
    const arrow = document.querySelector('img#arrowMain');

    arrow.classList.remove('left', 'bottom', 'right');
});

controller.onInput('KeyA', () => {
    const arrow = document.querySelector('img#arrowMain');
    
    arrow.classList.remove('left', 'bottom', 'right');
    arrow.classList.add('left');
});

controller.onInput('KeyS', () => {
    const arrow = document.querySelector('img#arrowMain');
    
    arrow.classList.remove('left', 'bottom', 'right');
    arrow.classList.add('bottom');
});

controller.onInput('KeyD', () => {
    const arrow = document.querySelector('img#arrowMain');
    
    arrow.classList.remove('left', 'bottom', 'right');
    arrow.classList.add('right');
});