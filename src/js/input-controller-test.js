// TODO: Добавил игровой цикл
// BUG: Без игрового цикла кнопка убирается из
//      списка только следующего нажатия любой кнопки.

/**
 * @param {string} groupName
 * @param {() => any} callback
 */
const consoleGroup = (groupName, callback) => {
  console.group(groupName);
  callback();
  console.groupEnd();
};

/**
 * Данная функция позволяет двигать красный квадрат с помощью забинженных
 * кнопок.
 *
 * @param {number} stepsByX    определяет количество шагов, на которые надо сходить по оси X.
 * @param {number} stepsByY    определяет количество шагов, на которые надо сходить по оси Y.
 */
const moveSquare = (stepsByX, stepsByY) => {
  /**
   * Объект игрока.
   *
   * @type {HTMLDivElement}
   */
  const reqSquare = document.querySelector('#redSquare');
  /** @type {number} */
  const pixelsPerStep = 1;

  const translate =
    reqSquare.style.translate === '0px' ? '0px 0px' : reqSquare.style.translate;
  const x = parseInt(translate.split(/\s/gi)[0]) + pixelsPerStep * stepsByX;
  const y =
    (isNaN(parseInt(translate.split(/\s/gi)[1]))
      ? 0
      : parseInt(translate.split(/\s/gi)[1])) +
    pixelsPerStep * stepsByY;

  const newTranslateStr = `${x}px ${y}px`;

  reqSquare.style.translate = newTranslateStr;
};

const controller = new InputController({
  left: {
    keys: [65, 1092],
    enabled: true,
    onEvent: () => moveSquare(-1, 0),
  },
  bottom: {
    keys: [83, 1099],
    enabled: true,
    onEvent: () => moveSquare(0, 1),
  },
  right: {
    keys: [68, 1074],
    enabled: true,
    onEvent: () => moveSquare(1, 0),
  },
  top: {
    keys: [87, 1094],
    enabled: true,
    onEvent: () => moveSquare(0, -1),
  },
});

controller.attach(document, true);

/** Выводим данные. */
const inlineData = () => {
  /** @type {string} */
  const textToInsert = [
    `Контроллер включен: ${controller.enabled}`,
    '',
    'Actions:',
    JSON.stringify(controller.actions, null, 2),
  ].join('\n');

  document.querySelector('#info-preview p').innerText = textToInsert;
};

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
  controller.activateController();
  inlineData();
};

devButtons.deactivateButton.onclick = () => {
  controller.deactivateController();
  inlineData();
};

devButtons.bindJumpButton.onclick = () => {
  controller.bindActions({
    jump: {
      keys: [32],
      enabled: true,
      activate: () => {
        /** @type {HTMLDivElement} */
        const reqSquare = document.querySelector('#redSquare');

        reqSquare.classList.add('jump');
      },
      deactivate: () => {
        /** @type {HTMLDivElement} */
        const reqSquare = document.querySelector('#redSquare');

        reqSquare.classList.remove('jump');
      },
    },
  });
  inlineData();
};
