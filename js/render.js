'use strict';

/**
 * Canvas drawing. Reads game state and never changes it.
 */
const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.W = DATA.COLS * DATA.TILE;
    this.H = DATA.ROWS * DATA.TILE;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = this.W * dpr;
    canvas.height = this.H * dpr;
    this.ctx = canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** view: { hoverTile, placing, selected, time } */
  draw(view) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    this.drawMap();
    this.drawAuras();
    this.drawTowers(view);
    this.drawEnemies();
    this.drawFx();
    this.drawRanges(view);
    this.drawBanner();
  }

  // ------------------------------------------------------------------- map

  drawMap() {
    const ctx = this.ctx;
    const T = DATA.TILE;
    const path = this.game.path;
    for (let r = 0; r < DATA.ROWS; r++) {
      for (let c = 0; c < DATA.COLS; c++) {
        const onPath = path.tiles.has(c + ',' + r);
        if (onPath) ctx.fillStyle = (c + r) % 2 ? '#d9c9a0' : '#e0d1aa';
        else ctx.fillStyle = (c + r) % 2 ? '#3d7a4b' : '#438353';
        ctx.fillRect(c * T, r * T, T, T);
      }
    }
    // Gate and portal markers
    this.label('⏰', 0.5 * T, 1.5 * T, 24);
    this.smallText('DEADLINE', 0.5 * T, 1.5 * T + 20);
    this.label('🎓', 15.5 * T, 7.5 * T, 24);
    this.smallText('RESULTS', 15.5 * T, 7.5 * T + 20);
  }

  label(text, x, y, size) {
    const ctx = this.ctx;
    ctx.font = size + 'px ' + EMOJI_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(text, x, y);
  }

  smallText(text, x, y) {
    const ctx = this.ctx;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5a4a2a';
    ctx.fillText(text, x, y);
  }

  // ---------------------------------------------------------------- shapes

  shapePath(shape, x, y, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(x, y, r, 0, Math.PI * 2);
      return;
    }
    const sides = { diamond: 4, square: 4, hexagon: 6, triangle: 3 }[shape] || 4;
    const rot = { diamond: -Math.PI / 2, square: -Math.PI / 4, hexagon: 0, triangle: -Math.PI / 2 }[shape] || 0;
    const rad = shape === 'square' ? r * 1.2 : r * 1.1;
    for (let i = 0; i < sides; i++) {
      const a = rot + (i * Math.PI * 2) / sides;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // ---------------------------------------------------------------- towers

  drawAuras() {
    const ctx = this.ctx;
    const T = DATA.TILE;
    for (const t of this.game.towers) {
      if (t.kind !== 'extension') continue;
      const s = this.game.statsOf(t);
      ctx.beginPath();
      ctx.arc(t.x * T, t.y * T, s.range * T, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79,195,247,0.10)';
      ctx.fill();
    }
  }

  drawTowers(view) {
    const ctx = this.ctx;
    const T = DATA.TILE;
    for (const t of this.game.towers) {
      const def = DATA.towers[t.kind];
      const x = t.x * T;
      const y = t.y * T;
      const selected = view.selected === t;
      this.shapePath(def.shape, x, y, T * 0.36);
      ctx.fillStyle = def.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = selected ? 3 : 2;
      ctx.strokeStyle = selected ? '#fff' : 'rgba(0,0,0,0.55)';
      ctx.stroke();
      this.label(def.emoji, x, y + 1, T * 0.5);

      // Level pips
      for (let i = 0; i <= t.level; i++) {
        ctx.beginPath();
        ctx.arc(x - t.level * 4 + i * 8, y + T * 0.42, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (t.slowed) this.label('💤', x + T * 0.3, y - T * 0.3, 14);

      // Public Holiday pulse progress
      if (t.kind === 'holiday') {
        const s = this.game.statsOf(t);
        const frac = 1 - Math.max(0, Math.min(1, t.cd / s.interval));
        ctx.beginPath();
        ctx.arc(x, y, T * 0.43, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  drawRanges(view) {
    const ctx = this.ctx;
    const T = DATA.TILE;
    const g = this.game;
    let range = null;
    let x = 0;
    let y = 0;
    let color = 'rgba(255,255,255,0.8)';
    let ok = true;

    if (view.placing && view.hoverTile) {
      const def = DATA.towers[view.placing];
      const { c, r } = view.hoverTile;
      ok = g.canBuildAt(c, r) && g.sp >= def.cost && !(def.max && g.countOf(view.placing) >= def.max);
      range = def.levels[0].range;
      x = (c + 0.5) * T;
      y = (r + 0.5) * T;
      // Ghost preview of the tower
      ctx.globalAlpha = 0.6;
      this.shapePath(def.shape, x, y, T * 0.36);
      ctx.fillStyle = ok ? def.color : '#e53935';
      ctx.fill();
      ctx.globalAlpha = 1;
      this.label(def.emoji, x, y + 1, T * 0.5);
      color = ok ? 'rgba(255,255,255,0.85)' : 'rgba(255,90,90,0.9)';
    } else if (view.selected) {
      range = g.statsOf(view.selected).range;
      x = view.selected.x * T;
      y = view.selected.y * T;
    }
    if (range === null) return;
    ctx.beginPath();
    ctx.arc(x, y, range * T, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  // --------------------------------------------------------------- enemies

  drawEnemies() {
    const ctx = this.ctx;
    const T = DATA.TILE;
    // Draw bigger enemies first so small ones stay visible on top.
    const list = this.game.enemies.filter((e) => e.alive)
      .sort((a, b) => DATA.enemies[b.type].size - DATA.enemies[a.type].size);
    for (const e of list) {
      const def = DATA.enemies[e.type];
      const fam = DATA.familyStyle[def.family];
      const x = e.x * T;
      const y = e.y * T;
      const r = def.size * T;
      ctx.globalAlpha = e.invisible ? 0.18 : 1;

      this.shapePath(fam.shape, x, y, r);
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : fam.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = e.slow > 0 ? '#4fc3f7' : 'rgba(0,0,0,0.6)';
      ctx.stroke();
      this.label(def.emoji, x, y + 1, r * 1.5);

      if (e.pause > 0) this.label('💤', x + r, y - r, 14);
      ctx.globalAlpha = 1;

      // Health bar
      if (e.hp < e.maxHp || def.boss) {
        const w = Math.max(r * 2, 20);
        const bx = x - w / 2;
        const by = y - r - 9;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(bx, by, w, 4);
        ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#66bb6a' : e.hp / e.maxHp > 0.25 ? '#ffca28' : '#ef5350';
        ctx.fillRect(bx, by, w * Math.max(0, e.hp / e.maxHp), 4);
      }
    }
  }

  // --------------------------------------------------------------- effects

  drawFx() {
    const ctx = this.ctx;
    const T = DATA.TILE;
    for (const f of this.game.fx) {
      const k = f.t / f.life;
      if (f.kind === 'beam') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(f.x1 * T, f.y1 * T);
        ctx.lineTo(f.x2 * T, f.y2 * T);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f.kind === 'ring') {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(f.x * T, f.y * T, f.radius * T * (0.3 + 0.7 * k), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f.kind === 'text') {
        ctx.globalAlpha = 1 - k * k;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.strokeText(f.text, f.x * T, (f.y - k * 0.8) * T);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x * T, (f.y - k * 0.8) * T);
        ctx.globalAlpha = 1;
      }
    }
  }

  drawBanner() {
    const b = this.game.banner;
    if (!b) return;
    const ctx = this.ctx;
    const remaining = b.life - b.t;
    ctx.globalAlpha = Math.min(1, remaining / 0.5, b.t / 0.2);
    ctx.font = 'bold 22px sans-serif';
    const w = ctx.measureText(b.text).width + 40;
    const x = (this.W - w) / 2;
    ctx.fillStyle = 'rgba(0, 40, 80, 0.88)';
    ctx.beginPath();
    ctx.roundRect(x, 14, w, 44, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.text, this.W / 2, 37);
    ctx.globalAlpha = 1;
  }
}
