# WAM Defence: Survive the Semester

A tower defence game set over one Monash University semester. Defend your WAM against assignments, bad teammates and sickness, one week at a time, all the way to the final exam.

> **Status:** Built and playable. This README is the game design document and the build plan.
> **Build target:** A playable game in about **30 minutes** of build time, with a built-in **Demo Mode** that shows every feature in about **5 minutes**.

## Quick Start

1. Open `index.html` in a modern browser (Edge, Chrome or Firefox). No install and no server are needed.
2. Click **Play** for a normal run, or **Demo Mode** for the presentation tools.
3. You can also open `index.html?demo=1` to highlight the Demo Mode button on the title screen.

---

## Table of Contents

1. [Elevator Pitch](#1-elevator-pitch)
2. [30-Minute Scope](#2-30-minute-scope)
3. [Core Concept Mapping](#3-core-concept-mapping)
4. [How the Game Works](#4-how-the-game-works)
5. [WAM (Life Points) and Grades](#5-wam-life-points-and-grades)
6. [Resource: Study Points](#6-resource-study-points)
7. [Towers](#7-towers)
8. [Enemies](#8-enemies)
9. [Semester Schedule (Rounds)](#9-semester-schedule-rounds)
10. [The Final Exam (Boss)](#10-the-final-exam-boss)
11. [Map Design](#11-map-design)
12. [Controls and Interface](#12-controls-and-interface)
13. [Demo Mode (For the Presentation)](#13-demo-mode-for-the-presentation)
14. [Tech Stack and File Layout](#14-tech-stack-and-file-layout)
15. [30-Minute Build Plan](#15-30-minute-build-plan)
16. [Future Ideas (Out of Scope)](#16-future-ideas-out-of-scope)
17. [Accessibility and Tone](#17-accessibility-and-tone)
18. [Design Decisions](#18-design-decisions)
19. [Disclaimer](#19-disclaimer)

---

## 1. Elevator Pitch

Every Monash student knows the feeling: three deadlines in one week, a group member who has gone silent, and a cold that arrives the night before a quiz. This game turns that into a strategy challenge.

You place support "towers" such as a great lecturer, a short extension and a public holiday to stop threats from reaching your results. You have 12 teaching weeks plus an exam week. You start with a WAM of 100. Every threat that gets through takes a chunk of it. Finish the semester with as much WAM as you can.

**Genre:** Tower defence (single player, wave based)
**Full run length:** About 12 to 15 minutes at normal speed (about 6 to 8 minutes at 2x speed). The waves alone take about 9 minutes at 1x.
**Demo length:** About 5 minutes using Demo Mode
**Platform:** Web browser. Open `index.html` and play. No install and no server.

---

## 2. 30-Minute Scope

To finish in 30 minutes, the game keeps everything that makes it recognisable and cuts everything that is only extra polish.

### 2.1 In scope

| Area | What is included |
| --- | --- |
| Rounds | 12 teaching weeks plus the exam week, all driven by a data table |
| Life points | WAM from 100 down to 0, with the final grade (HD, D, C, P, N) |
| Currency | Study Points (SP) |
| Towers | All four: Good Lecturer, Short Extension, AI Improvement, Public Holiday |
| Tower upgrades | One upgrade level per tower (2 levels total) |
| Enemies | 7 regular types covering all three families (see [Enemies](#8-enemies)) |
| Boss | The Final Exam with three phases |
| Map | One fixed map with one path |
| Flow | Title screen, prep phase, wave phase, results screen, win and lose screens |
| Demo Mode | Week jumping, enemy spawner, instant defence and more (see [Demo Mode](#13-demo-mode-for-the-presentation)) |

### 2.2 Cut from the first build

| Cut item | Why |
| --- | --- |
| Third upgrade level for towers | Doubles balancing work for little gain |
| Last-Minute Larry and Burnout enemies | Three families are already covered by the remaining enemies |
| Mid-Semester Test and Major Project Deadline mini-bosses | The Final Exam is the only boss |
| Sound and music | Not needed to show the game |
| Weekly random events, extra maps, difficulty modes, high scores | See [Future Ideas](#16-future-ideas-out-of-scope) |
| Phaser, TypeScript, Vite | Setup time alone would use a large part of the 30 minutes |

### 2.3 Definition of done

The build is finished when all of these are true:

- [x] Opening `index.html` in a browser shows the title screen with no errors
- [x] A full run from Week 1 to the Final Exam can be played to a win or a loss
- [x] All 4 towers can be placed, upgraded and sold
- [x] All 7 regular enemies and the boss appear and behave as described
- [x] The grade screen shows the correct grade for the final WAM
- [x] Demo Mode can reach every week and every enemy within 5 minutes

*How this was checked:* a headless Edge run clicked through Demo Mode, a normal run, placing a tower, the exam boss, the win screen and the lose screen with no console errors, and a headless simulation played full runs. It has not yet been played by a person, and only Edge was used. Please play one full run and rehearse the demo once before presenting.

---

## 3. Core Concept Mapping

| Real-life idea | Game mechanic |
| --- | --- |
| Teaching weeks 1 to 12 | Rounds 1 to 12 |
| Exam period (after Week 12) | Final round with a boss |
| WAM (weighted average mark), starting at 100 | Life points, starting at 100 |
| Assignments, bad teammates, sickness | Enemy types |
| Good lecturer, short extension, AI improvement, public holiday | Tower types |
| Time and energy to study | Study Points (currency) |
| Results release | The goal tile enemies are trying to reach |
| HD / D / C / P / N | Final score rating |

The WAM mechanic is an abstraction. A real WAM is an average of marks, not a health bar. In the game, each threat that gets through represents marks lost.

---

## 4. How the Game Works

### 4.1 Goal

Reach the end of exam week with your WAM above 0. The higher your final WAM, the better your grade.

### 4.2 Round structure

Each week is one round with three phases:

1. **Prep phase.** Nothing moves. Spend Study Points to place, upgrade or sell towers. A preview shows the incoming threats for the week.
2. **Wave phase.** Enemies spawn at the Deadline Gate and walk the path toward the Results Portal. Towers fire automatically. You can still build during this phase.
3. **Results phase.** A summary shows enemies defeated, WAM lost and Study Points earned. The next week begins when you continue.

### 4.3 Win and lose conditions

- **Lose:** WAM reaches 0 at any time. The run ends with "Withdrawn from unit".
- **Win:** You finish the Final Exam round with WAM above 0. Defeating the boss ends the exam immediately. If the boss leaks, you take its damage and the round ends once every remaining enemy is gone.

### 4.4 What an enemy "leak" means

An enemy that reaches the Results Portal is removed and deals its **WAM damage** to you. Sickness enemies also drain Study Points when they leak (see [Enemies](#8-enemies)).

---

## 5. WAM (Life Points) and Grades

You start every run with **100 WAM**. At the end of the Final Exam, your remaining WAM maps to a grade using the Monash grade bands:

| Final WAM | Grade | Title shown on results screen |
| --- | --- | --- |
| 80 to 100 | HD (High Distinction) | "Top of the class" |
| 70 to 79 | D (Distinction) | "Solid semester" |
| 60 to 69 | C (Credit) | "Comfortable" |
| 50 to 59 | P (Pass) | "Pass is a pass" |
| 1 to 49 | N (Fail) | "Time for a supplementary" |
| 0 (reached during the run) | Game over | "Withdrawn from unit" |

A **Perfect Semester** badge is awarded for finishing with a WAM of 100.

---

## 6. Resource: Study Points

Study Points (SP) are the only currency.

| Source | Amount |
| --- | --- |
| Starting balance | 150 SP |
| Weekly stipend (when each new week begins, from Week 2) | 50 SP |
| Defeating an enemy | Varies by enemy (see [Enemies](#8-enemies)) |
| Selling a tower | 70% of total SP invested in it |

---

## 7. Towers

Towers are placed on build tiles beside the path. Each tower has 2 levels. All numbers are **starting values** and may be tuned after a quick playtest.

### 7.1 Overview

| Tower | Cost | Role | Level 1 | Level 2 (upgrade) |
| --- | --- | --- | --- | --- |
| Good Lecturer | 50 SP | Reliable damage | 10 damage, 1 shot per sec, range 3 | **Award Winning** (90 SP): 18 damage, range 4, hits 2 targets |
| Short Extension | 40 SP | Slows enemies | 30% slow, range 3 | **Special Consideration** (60 SP): 55% slow, range 4 |
| AI Improvement | 100 SP | High damage, high risk | 35 damage, 1 shot per 2 sec, range 4, 10% hallucination | **Verified Sources** (120 SP): 50 damage, 4% hallucination |
| Public Holiday | 90 SP | Pauses enemies in an area | 2 sec pause every 10 sec, range 2 | **Study Week** (100 SP): 3 sec pause every 7 sec |

### 7.2 Tower rules

- **Good Lecturer** targets the enemy furthest along the path.
- **Short Extension** is an area effect, so it also slows enemies that cannot be targeted (Ghosts). Slows from several towers do not stack. The strongest slow applies.
- **AI Improvement** ignores armour. Each shot can **hallucinate** and deal no damage. Every other AI Improvement tower on the map adds **+5%** to that chance, so relying on AI too much has a cost. A hallucinated shot shows a "?" above the tower.
- **Public Holiday** is limited to **2 on the map at once**. The first pulse happens 2 seconds after placement.
- **Selling** returns 70% of the total SP spent on the tower.

### 7.3 Tower synergies

- **Short Extension + any damage tower:** slowed enemies spend more time in range.
- **Public Holiday + AI Improvement:** paused enemies are easy targets, so risky shots have more chances to land.
- **Good Lecturer clusters:** cheap and consistent against swarms.

---

## 8. Enemies

Enemies fall into three families. Each family pressures a different part of your defence.

Speeds are in tiles per second: Slow 0.7, Normal 1.1, Fast 1.8, Very slow 0.45.

HP values below are **base values**. Each week multiplies the HP of regular enemies (see [Semester Schedule](#9-semester-schedule-rounds)). Bosses are not scaled.

### 8.1 Assignments (raw damage and bulk)

| Enemy | HP | Speed | WAM damage | SP reward | Notes |
| --- | --- | --- | --- | --- | --- |
| Quiz | 20 | Fast | 1 | 3 | Comes in large groups |
| Report | 60 | Normal | 3 | 6 | The standard enemy |
| Major Assignment | 200 | Slow | 8 | 20 | Armour 5 (each hit does 5 less, minimum 1) |

### 8.2 Bad Teammates (disruption)

| Enemy | HP | Speed | WAM damage | SP reward | Notes |
| --- | --- | --- | --- | --- | --- |
| Ghost | 40 | Normal | 2 | 6 | Invisible for 2 sec out of every 5 sec. Cannot be targeted while invisible. |
| Free-rider | 80 | Slow | 3 | 10 | Good Lecturer and AI Improvement towers within 2 tiles fire 30% slower while it is nearby |

### 8.3 Sickness (swarms and attrition)

| Enemy | HP | Speed | WAM damage | SP reward | Notes |
| --- | --- | --- | --- | --- | --- |
| Cold | 15 | Fast | 1 | 2 | Appears in swarms |
| Flu | 90 | Normal | 3 | 10 | Splits into 3 Colds when defeated. If it leaks, you lose 10 SP. |

### 8.4 Boss

| Enemy | HP | Speed | WAM damage | SP reward |
| --- | --- | --- | --- | --- |
| The Final Exam | 2500 | Very slow | 25 | n/a |

### 8.5 Counters at a glance

| Threat | Best answers |
| --- | --- |
| Quiz and Cold swarms | Several Good Lecturers, Public Holiday |
| Ghost | Short Extension (slows even when invisible), Public Holiday |
| Free-rider | Kill it early, or keep damage towers more than 2 tiles from its path |
| Major Assignment | AI Improvement (ignores armour) |
| Flu | Enough damage near the end of the path to clear the Colds it releases |

---

## 9. Semester Schedule (Rounds)

Each week introduces a theme and sometimes a new enemy. The waves are stored in a data table, so changing them takes seconds.

| Week | Theme | New enemy | Wave composition |
| --- | --- | --- | --- |
| 1 | Orientation | Quiz | 8 Quizzes |
| 2 | Early quizzes | Cold | 10 Quizzes, 4 Colds |
| 3 | First report due | Report | 6 Quizzes, 4 Reports |
| 4 | Flu season | Flu | 3 Quizzes, 8 Colds, 2 Flu |
| 5 | Group work begins | Ghost | 5 Reports, 4 Ghosts |
| 6 | Mid-semester test | none | 8 Reports, 6 Quizzes, 4 Colds |
| 7 | Someone stopped replying | Free-rider | 6 Reports, 3 Free-riders, 4 Colds |
| 8 | Peak flu | none | 4 Flu, 10 Colds, 4 Ghosts |
| 9 | Group project crunch | none | 4 Reports, 4 Free-riders, 5 Ghosts |
| 10 | Major assignment | Major Assignment | 3 Major Assignments, 6 Reports, 6 Quizzes |
| 11 | Running on empty | none | 4 Major Assignments, 3 Flu, 4 Free-riders |
| 12 | Everything is due | none | 5 Major Assignments, 4 Flu, 3 Free-riders, 8 Quizzes |
| Exam | Final Exam | The Final Exam (boss) | See [The Final Exam](#10-the-final-exam-boss) |

Enemies in each wave are interleaved, not sent in blocks. The gap between spawns is shorter for small enemies (Colds and Quizzes) and longer for large ones.

**HP scaling.** A playtest with a simulated player showed that unscaled enemies were far too easy, so regular enemy HP is multiplied by the week's value:

| Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | Exam |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HP multiplier | 1.0 | 1.0 | 1.2 | 1.5 | 1.8 | 2.2 | 2.6 | 3.0 | 3.5 | 4.2 | 5.0 | 6.0 | 5.0 |

For example, a Report has 60 HP in Week 1 and 360 HP in Week 12. The multipliers are in `hpScale` in `js/data.js`.

**Pacing goals**
- Weeks 1 to 3 teach the basics and are forgiving.
- Weeks 4 to 9 introduce one new idea at a time.
- Weeks 10 to 12 combine everything and apply real pressure.
- A decent run should reach the exam with a WAM in the 70s or 80s.
- In headless test runs, a simulated player that spent all its Study Points well finished with a WAM of about 67 to 84. A player who built only 5 towers was withdrawn around Week 12. This was a quick check, not a full playtest, so expect to tune with real players.

---

## 10. The Final Exam (Boss)

The Final Exam is a single large boss with three phases. It walks the path slowly, and a new phase starts at each health threshold. A banner announces each phase.

| Phase | Trigger | What happens |
| --- | --- | --- |
| 1. Multiple Choice | Boss spawns (100% HP) | Releases a swarm of 20 Quizzes |
| 2. Short Answer | Boss falls below 66% HP | Spawns 6 Reports and 3 Ghosts |
| 3. Essay | Boss falls below 33% HP | Boss speed increases by 50% and 2 Major Assignments spawn |

If the boss reaches the Results Portal, you lose 25 WAM. Defeating it ends the run immediately and shows your final grade.

---

## 11. Map Design

- A single winding path from the **Deadline Gate** (spawn, left edge) to the **Results Portal** (goal, right edge).
- Grid based: 16 by 10 tiles, 48 pixels per tile (768 by 480 canvas).
- Path layout, in tile coordinates: enter at row 1, run right to column 12, go down to row 4, run left to column 3, go down to row 7, then run right to the exit. This gives roughly 41 tiles of path with plenty of build space between the lanes.
- Build tiles are every tile that is not on the path.
- The look is a simple campus theme: green lawn tiles, tan path tiles and a Monash-blue interface. Each enemy and tower has a unique emoji icon.

---

## 12. Controls and Interface

| Action | Input |
| --- | --- |
| Select a tower to build | Click it in the build bar, or press `1` to `4` |
| Place tower | Click a free tile (hold `Shift` to keep placing) |
| Select a placed tower | Click it (shows upgrade and sell buttons) |
| Upgrade or sell selected tower | `U` / `S`, or the buttons in the info panel |
| Start the week | `Space` or the Start button |
| Pause | `P` |
| Toggle 1x / 2x speed | `F` |
| Cancel placement or selection | `Esc` or right click |

**Heads-up display**
- WAM bar and number
- Study Points
- Week tracker showing Weeks 1 to 12 and Exam
- Wave preview during prep, with a "new threat" highlight
- Info panel for towers and for the enemy under the mouse
- Short messages such as "Not enough SP"

---

## 13. Demo Mode (For the Presentation)

Demo Mode lets you show **every part of the game in about 5 minutes**. Start it from the **Demo Mode** button on the title screen, or open `index.html?demo=1`. Normal play stays unchanged.

### 13.1 Demo panel

A panel appears beside the game with these tools:

| Tool | What it does |
| --- | --- |
| **Jump to week** (buttons 1 to 12 and Exam) | Goes straight to that week in prep phase. Towers stay in place. |
| **Spawn enemy** (dropdown and button) | Sends one of any enemy type, including the boss, down the path right now |
| **Build demo defence** | Instantly places a ready-made layout with all four tower types at Level 2 |
| **+500 SP** | Adds Study Points so you can build freely on stage |
| **God mode** | WAM cannot fall below 1, so the demo never ends early |
| **Auto-start weeks** | Starts each wave automatically and continues past the results screen |
| **Speed** (1x, 2x, 4x) | Speeds up the game for long waves |
| **Clear enemies** (`K`) | Removes every enemy on the map. In a wave, this also ends it. |
| **Reset** | Restarts the run from Week 1 |

Hotkeys: `N` goes to the next week, `K` clears enemies, `G` toggles god mode.

### 13.2 Five-minute run sheet

| Time | What to do | What to say |
| --- | --- | --- |
| 0:00 to 0:30 | Show the title screen and the HUD | The concept: weeks are rounds, WAM is life, enemies are student problems, towers are the support systems |
| 0:30 to 1:30 | Start Demo Mode. Place a Good Lecturer, start Week 1 | How a normal week works: prep, wave, results. Show SP gained and the WAM bar |
| 1:30 to 2:15 | Jump to Week 5. Place a Short Extension and a Good Lecturer | Ghosts go invisible, but the extension still slows them |
| 2:15 to 3:00 | Jump to Week 7. Place an AI Improvement and a Public Holiday | Free-riders slow nearby towers. AI can hallucinate ("?"). Public Holiday pauses enemies |
| 3:00 to 3:30 | Use **Spawn enemy** for Flu and Major Assignment | Flu splits into Colds. Armour on Major Assignments, and AI ignores it |
| 3:30 to 4:30 | Click **Build demo defence**, enable **God mode**, jump to **Exam**, set speed to 2x | The three boss phases: Quizzes, then Reports and Ghosts, then a faster boss |
| 4:30 to 5:00 | Show the grade screen | The final grade, what was built, and what comes next |

### 13.3 Demo safety net

- If something goes wrong, press **Reset** or reload the page. A run sheet is always one click away.
- If time is short, skip straight to step 3:30. The boss fight shows the most features at once.
- Test the demo once before the presentation, in the same browser you will use on the day.

---

## 14. Tech Stack and File Layout

**Plain HTML, CSS and JavaScript with a Canvas.** No frameworks, no build step and no dependencies. Open `index.html` and it runs. The earlier proposal for Phaser, TypeScript and Vite is dropped because setup alone would use a large part of the 30 minutes.

```
index.html      Page layout, canvas and side panel
style.css       Styles (Monash blue theme)
js/data.js      All numbers: towers, enemies, weeks, grades, map path
js/game.js      Game rules and state, with no drawing code
js/render.js    Draws the map, towers, enemies and effects on the canvas
js/ui.js        Buttons, keyboard, overlays and the info panel
js/demo.js      Demo Mode panel and tools
```

All stats live in `js/data.js`, so balancing never needs a rules change. Scripts use plain `<script>` tags, not modules, so the game also runs when opened straight from the file system.

---

## 15. 30-Minute Build Plan

Time boxes for the build. If a step runs over, use the cut line at the bottom.

| Minutes | Step | Result |
| --- | --- | --- |
| 0 to 5 | Page, canvas, data file, map and path | The map draws and an enemy can walk the path |
| 5 to 10 | Enemies, WAM, leaking, health bars | Enemies spawn, walk, leak and reduce WAM |
| 10 to 17 | Four towers, Study Points, placing, upgrading, selling | Towers fire and the economy works |
| 17 to 23 | Weeks, wave data, prep/wave/results flow, grades | A full run from Week 1 to the exam can be played |
| 23 to 27 | Boss phases, title screen, win and lose screens | The Final Exam works and the run ends properly |
| 27 to 30 | Demo Mode and a final check against the definition of done | Ready to present |

**Cut line if running late (drop in this order):**
1. Enemy hover info
2. The `Shift` multi-place option
3. Tower upgrades (keep Level 1 only)
4. Auto-start weeks in Demo Mode

**Never cut:** the four towers, the three enemy families, the boss, the grade screen and the Jump to week tool. They are what the demo is built on.

---

## 16. Future Ideas (Out of Scope)

- Third tower level, Last-Minute Larry, Burnout and mid-semester mini-bosses
- Weekly random events (Moodle outage, study group, lecture recording)
- More maps and difficulty modes
- Sound, music and a local high score table
- A mid-semester break between Weeks 6 and 7

---

## 17. Accessibility and Tone

- Colour is never the only signal. Enemies use different shapes by family (squares for assignments, circles for teammates, triangles for sickness) plus a unique icon.
- Pause and 2x speed are always available.
- Most actions have a keyboard shortcut.
- **Tone note:** The game uses humour about sickness and burnout because they are real student experiences. Jokes are aimed at the situation, never at people with health or mental health conditions.

---

## 18. Design Decisions

- **Study Points added.** Towers need a cost, and a currency creates real choices.
- **Game over at 0 WAM,** with the grade shown at the end. A fail line at 50 would make the first half of the WAM bar meaningless.
- **Each enemy family has its own job:** assignments are bulk, bad teammates disrupt, sickness comes in swarms and drains SP.
- **Each tower is a trade-off:** the Short Extension does no damage, AI can fail, and Public Holidays are limited to two.
- **Real Monash grade bands** (HD, D, C, P, N) are used for the end result.
- **No mid-semester break, no academic integrity penalty, single player only.** These keep the first build inside 30 minutes.
- **Demo Mode is part of the product,** not an afterthought, because the presentation is a main goal.

---

## 19. Disclaimer

This is an unofficial student project. It is not endorsed by or affiliated with Monash University. Before sharing publicly, check whether the use of the Monash name, logo and campus imagery is permitted. If it is not, rename the university in the game.
