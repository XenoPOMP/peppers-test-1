// TODO: Добавил игровой цикл
const controller = new InputController({
  left: {
    keys: [65],
    enabled: true,
    onEvent: () => {
      // console.log('Start moving left.');
    },
    afterEvent: () => {
      // console.log('Stop moving left.');
    },
  },
});

controller.attach(window);
