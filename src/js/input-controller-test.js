// TODO: Добавил игровой цикл
// BUG: Без игрового цикла кнопка убирается из
//      списка только следующего нажатия любой кнопки.
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
