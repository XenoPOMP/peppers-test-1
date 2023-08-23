// TODO: Добавил игровой цикл
const controller = new InputController({
  left: {
    keys: [65],
    enabled: true,
  },
});

controller.attach(window);
