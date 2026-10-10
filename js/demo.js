'use strict';

/**
 * Demo Mode panel. Lets a presenter jump between weeks, spawn any enemy, build a ready-made
 * defence and more, so the whole game can be shown in about five minutes.
 */
class DemoPanel {
  constructor(app, el) {
    this.app = app;
    this.el = el;
    this.build();
    el.addEventListener('click', (e) => this.onClick(e));
    el.addEventListener('change', (e) => this.onChange(e));
  }

  build() {
    const weekButtons = [];
    for (let w = 1; w <= DATA.TEACHING_WEEKS; w++) {
      weekButtons.push('<button type="button" data-demo="week" data-week="' + w + '">' + w + '</button>');
    }
    weekButtons.push('<button type="button" data-demo="week" data-week="' + DATA.EXAM_WEEK + '">Exam</button>');

    const options = Object.keys(DATA.enemies).map((k) => {
      const d = DATA.enemies[k];
      return '<option value="' + k + '">' + d.emoji + ' ' + d.name + '</option>';
    }).join('');

    this.el.innerHTML =
      '<h2>Demo Mode</h2>' +
      '<div class="demo-label">Jump to week</div>' +
      '<div class="demo-row">' + weekButtons.join('') + '</div>' +
      '<div class="demo-label">Spawn enemy</div>' +
      '<div class="demo-row"><select id="demo-enemy" aria-label="Enemy to spawn">' + options + '</select>' +
      '<button type="button" data-demo="spawn">Spawn</button></div>' +
      '<div class="demo-row">' +
      '<button type="button" data-demo="defence">Build demo defence</button>' +
      '<button type="button" data-demo="sp">+500 SP</button>' +
      '<button type="button" data-demo="next">Next week [N]</button>' +
      '<button type="button" data-demo="clear">Clear enemies [K]</button>' +
      '<button type="button" data-demo="reset">Reset</button>' +
      '</div>' +
      '<label class="demo-check"><input type="checkbox" id="demo-god"> God mode [G] (WAM never below 1)</label>' +
      '<label class="demo-check"><input type="checkbox" id="demo-auto"> Auto-start weeks</label>' +
      '<div class="demo-label">Speed: 1x, 2x or 4x with the Speed button or F.</div>';
  }

  show() {
    this.el.classList.remove('hidden');
    this.setGod(false);
    this.el.querySelector('#demo-auto').checked = false;
    this.app.autoStart = false;
  }

  hide() {
    this.el.classList.add('hidden');
  }

  setGod(on) {
    this.app.game.godMode = on;
    this.el.querySelector('#demo-god').checked = on;
    if (on && this.app.game.wam < 1) this.app.game.wam = 1;
  }

  onChange(e) {
    if (e.target.id === 'demo-god') this.setGod(e.target.checked);
    if (e.target.id === 'demo-auto') {
      this.app.autoStart = e.target.checked;
      this.app.autoTimer = 1.5;
    }
  }

  onClick(e) {
    const btn = e.target.closest('[data-demo]');
    if (!btn) return;
    const action = btn.dataset.demo;
    if (action === 'week') this.jump(Number(btn.dataset.week));
    else if (action === 'spawn') this.spawn(this.el.querySelector('#demo-enemy').value);
    else if (action === 'defence') this.buildDefence();
    else if (action === 'sp') this.addSP();
    else if (action === 'next') this.next();
    else if (action === 'clear') this.clear();
    else if (action === 'reset') this.reset();
    btn.blur();
  }

  handleKey(key) {
    if (key === 'n') this.next();
    else if (key === 'k') this.clear();
    else if (key === 'g') this.setGod(!this.app.game.godMode);
  }

  jump(week) {
    const { game } = this.app;
    if (game.isOver) return;
    this.app.hideOverlay();
    game.goToWeek(week, false);
    this.app.syncAfterChange();
    this.app.showToast(week === DATA.EXAM_WEEK ? 'Jumped to exam week' : 'Jumped to week ' + week);
  }

  next() {
    const { game } = this.app;
    if (game.isOver || game.week >= DATA.EXAM_WEEK) return;
    this.jump(game.week + 1);
  }

  spawn(type) {
    const { game } = this.app;
    if (game.isOver) return;
    game.spawnEnemy(type);
    this.app.syncAfterChange();
  }

  buildDefence() {
    const { game } = this.app;
    if (game.isOver) return;
    game.buildDemoDefence();
    this.app.syncAfterChange();
    this.app.showToast('Demo defence built');
  }

  addSP() {
    this.app.game.sp += 500;
    this.app.showToast('+500 SP');
  }

  clear() {
    const { game } = this.app;
    if (game.isOver) return;
    game.clearEnemies();
    this.app.syncAfterChange();
  }

  reset() {
    const { game } = this.app;
    const god = game.godMode;
    game.reset();
    game.godMode = god;
    this.app.placing = null;
    this.app.selected = null;
    this.app.paused = false;
    this.app.hideOverlay();
    this.app.syncAfterChange();
    this.app.showToast('Run reset');
  }
}
