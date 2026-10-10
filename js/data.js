'use strict';

/**
 * All game numbers live here. Change values in this file to rebalance the game.
 * Towers and enemies are described in README.md.
 */
const DATA = {
  TILE: 48,
  COLS: 16,
  ROWS: 10,

  START_WAM: 100,
  START_SP: 150,
  WEEKLY_STIPEND: 50,
  SELL_RATIO: 0.7,
  TEACHING_WEEKS: 12,
  EXAM_WEEK: 13,

  // Path in tile-centre coordinates. Tile (c, r) has its centre at (c + 0.5, r + 0.5).
  waypoints: [
    [-0.5, 1.5],
    [12.5, 1.5],
    [12.5, 4.5],
    [3.5, 4.5],
    [3.5, 7.5],
    [16.5, 7.5],
  ],

  // Tiles per second.
  speeds: { slow: 0.7, normal: 1.1, fast: 1.8, veryslow: 0.45 },

  towers: {
    lecturer: {
      name: 'Good Lecturer',
      emoji: '👨‍🏫',
      key: '1',
      cost: 50,
      shape: 'circle',
      color: '#f5b942',
      desc: 'Reliable damage. Shoots the enemy furthest along the path.',
      levels: [
        { name: 'Tutor', damage: 10, range: 3, interval: 1, targets: 1 },
        { name: 'Award Winning', cost: 90, damage: 18, range: 4, interval: 1, targets: 2 },
      ],
    },
    extension: {
      name: 'Short Extension',
      emoji: '⏳',
      key: '2',
      cost: 40,
      shape: 'diamond',
      color: '#4fc3f7',
      desc: 'Slows every enemy in range, even invisible ones. Does no damage.',
      levels: [
        { name: '2 Day Extension', slow: 0.3, range: 3 },
        { name: 'Special Consideration', cost: 60, slow: 0.55, range: 4 },
      ],
    },
    ai: {
      name: 'AI Improvement',
      emoji: '🤖',
      key: '3',
      cost: 100,
      shape: 'square',
      color: '#b388ff',
      desc: 'Heavy damage that ignores armour, but shots can hallucinate and miss. Each other AI tower adds +5% risk.',
      levels: [
        { name: 'Quick Draft', damage: 35, range: 4, interval: 2, halluc: 0.1 },
        { name: 'Verified Sources', cost: 120, damage: 50, range: 4, interval: 2, halluc: 0.04 },
      ],
    },
    holiday: {
      name: 'Public Holiday',
      emoji: '🏖️',
      key: '4',
      cost: 90,
      shape: 'hexagon',
      color: '#ff8a65',
      max: 2,
      desc: 'Pauses every enemy in range at regular intervals. Maximum 2 on the map.',
      levels: [
        { name: 'Long Weekend', pause: 2, interval: 10, range: 2 },
        { name: 'Study Week', cost: 100, pause: 3, interval: 7, range: 2 },
      ],
    },
  },

  // size is the enemy radius in tiles. gap is the delay (seconds) before the next spawn.
  enemies: {
    quiz: {
      name: 'Quiz', family: 'assignment', emoji: '📝', hp: 20, speed: 'fast', dmg: 1, reward: 3,
      size: 0.28, gap: 0.7, note: 'Fast. Arrives in large groups.',
    },
    report: {
      name: 'Report', family: 'assignment', emoji: '📄', hp: 60, speed: 'normal', dmg: 3, reward: 6,
      size: 0.32, gap: 1.2, note: 'The standard enemy.',
    },
    major: {
      name: 'Major Assignment', family: 'assignment', emoji: '📚', hp: 200, speed: 'slow', dmg: 8, reward: 20,
      size: 0.4, gap: 2.4, armour: 5, note: 'Armour 5: every hit does 5 less. AI Improvement ignores armour.',
    },
    ghost: {
      name: 'Ghost', family: 'teammate', emoji: '👻', hp: 40, speed: 'normal', dmg: 2, reward: 6,
      size: 0.3, gap: 1.2, note: 'Invisible 2 sec out of every 5. Cannot be targeted while invisible.',
    },
    freerider: {
      name: 'Free-rider', family: 'teammate', emoji: '🛋️', hp: 80, speed: 'slow', dmg: 3, reward: 10,
      size: 0.32, gap: 1.6, note: 'Lecturer and AI towers within 2 tiles fire 30% slower.',
    },
    cold: {
      name: 'Cold', family: 'sickness', emoji: '🤧', hp: 15, speed: 'fast', dmg: 1, reward: 2,
      size: 0.24, gap: 0.45, note: 'Fast. Appears in swarms.',
    },
    flu: {
      name: 'Flu', family: 'sickness', emoji: '🤒', hp: 90, speed: 'normal', dmg: 3, reward: 10,
      size: 0.3, gap: 1.5, spPenalty: 10, note: 'Splits into 3 Colds when defeated. Leaking costs 10 SP.',
    },
    finalexam: {
      name: 'The Final Exam', family: 'boss', emoji: '📜', hp: 2500, speed: 'veryslow', dmg: 25, reward: 0,
      size: 0.7, gap: 4, boss: true, note: 'Three phases. Releases minions as it takes damage.',
    },
  },

  familyStyle: {
    assignment: { color: '#4a90d9', shape: 'square', label: 'Assignment' },
    teammate: { color: '#e08a4a', shape: 'circle', label: 'Bad teammate' },
    sickness: { color: '#6dbb5a', shape: 'triangle', label: 'Sickness' },
    boss: { color: '#c0392b', shape: 'hexagon', label: 'Boss' },
  },

  // Enemy health is multiplied by this value for the current week (index 0 = Week 1, last = Exam).
  // Bosses ignore it. This keeps early weeks forgiving and late weeks tense.
  hpScale: [1, 1, 1.2, 1.5, 1.8, 2.2, 2.6, 3.0, 3.5, 4.2, 5, 6, 5],

  // Each group is [enemyType, count].
  weeks: [
    { theme: 'Orientation', groups: [['quiz', 8]] },
    { theme: 'Early quizzes', groups: [['quiz', 10], ['cold', 4]] },
    { theme: 'First report due', groups: [['quiz', 6], ['report', 4]] },
    { theme: 'Flu season', groups: [['quiz', 3], ['cold', 8], ['flu', 2]] },
    { theme: 'Group work begins', groups: [['report', 5], ['ghost', 4]] },
    { theme: 'Mid-semester test', groups: [['report', 8], ['quiz', 6], ['cold', 4]] },
    { theme: 'Someone stopped replying', groups: [['report', 6], ['freerider', 3], ['cold', 4]] },
    { theme: 'Peak flu', groups: [['flu', 4], ['cold', 10], ['ghost', 4]] },
    { theme: 'Group project crunch', groups: [['report', 4], ['freerider', 4], ['ghost', 5]] },
    { theme: 'Major assignment', groups: [['major', 3], ['report', 6], ['quiz', 6]] },
    { theme: 'Running on empty', groups: [['major', 4], ['flu', 3], ['freerider', 4]] },
    { theme: 'Everything is due', groups: [['major', 5], ['flu', 4], ['freerider', 3], ['quiz', 8]] },
    { theme: 'Final Exam', groups: [['finalexam', 1]] },
  ],

  // Enemy types that first appear in each week (used for the "new threat" highlight).
  newThreats: {
    1: ['quiz'], 2: ['cold'], 3: ['report'], 4: ['flu'], 5: ['ghost'], 7: ['freerider'], 10: ['major'], 13: ['finalexam'],
  },

  grades: [
    { code: 'HD', min: 80, name: 'High Distinction', title: 'Top of the class' },
    { code: 'D', min: 70, name: 'Distinction', title: 'Solid semester' },
    { code: 'C', min: 60, name: 'Credit', title: 'Comfortable' },
    { code: 'P', min: 50, name: 'Pass', title: 'Pass is a pass' },
    { code: 'N', min: 1, name: 'Fail', title: 'Time for a supplementary' },
  ],

  // Ready-made layout for Demo Mode: [kind, column, row, level].
  demoDefence: [
    ['lecturer', 2, 2, 1], ['lecturer', 6, 2, 1], ['lecturer', 10, 2, 1],
    ['extension', 8, 3, 1], ['extension', 14, 3, 1],
    ['ai', 5, 3, 1], ['ai', 10, 3, 1],
    ['holiday', 12, 6, 1], ['holiday', 2, 5, 1],
    ['lecturer', 6, 5, 1], ['lecturer', 9, 5, 1], ['lecturer', 4, 6, 1],
    ['lecturer', 8, 8, 1], ['lecturer', 12, 8, 1],
  ],
};
