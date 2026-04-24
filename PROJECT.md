# Lewis's Training Log — Project Guide

## Overview

A mobile-first PWA (Progressive Web App) for structured, science-backed gym tracking.
Works on Android via "Add to Home Screen" — deployed via GitHub Pages (same as guitar app).
Data stored locally on device (IndexedDB).

**App name options:** "Lewis's Training Log" / "LiftLog" / "Lewis Trains" — to decide at build.

---

## User Profile

| Stat | Value |
|------|-------|
| Name | Lewis |
| Height | 6ft (183cm) |
| Current weight | ~96–99kg |
| Previous peak | 90kg @ ~20% BF (after 6-month program) |
| Goal | Return to ~90kg, rebuild definition, stay consistent |
| Training days | 3x/week + occasional cycling |
| Smart scales | VeSync app (Etekcity) — manual data entry; Phase 3: CSV import |

**Estimated TDEE (maintenance):** ~2,500–2,800 kcal/day at ~97kg, lightly active.
**Recommended deficit for recomp:** 300–400 kcal/day → ~2,100–2,400 kcal target.
**Protein target:** 1.8–2.2g/kg → **175–215g/day** (top priority).

---

## Equipment

| Kit | Notes |
|-----|-------|
| Cable machine | Up to 50kg; **no vertical rows or heavy bottom-pulley lifts** (tips over) |
| Bench + free weights | Up to 60–80kg |
| Resistance bands | Assistance / finisher |
| Pull-up / dip / ab raise station | Bodyweight compounds |
| Indoor cycling | Logs: time, distance, calories (bike display) |
| VeSync smart scales | Weight, BF%, muscle mass, etc. — manual entry |
| Kitchen | Oven, pans, air fryer — no microwave |

---

## Session Design: 30 Minutes

**Structure:** 3 superset pairs per session. No standalone exercises.

Each superset pair:
- Pairs a push + pull, or compound + isolation targeting non-competing muscles
- 3 sets each side with 60s rest after completing both exercises
- ~6–7 min per pair × 3 pairs + 2 min warm-up = **~22–25 min working time**, ~30 min total

This gives **9 sets per primary muscle group per session** — well within the optimal hypertrophy range (10–20 sets/muscle/week). At 3x/week you accumulate enough volume without overtraining.

---

## 3-Day Split: Push / Pull / Legs+Core

### Day A — Push (Chest, Shoulders, Triceps) ~30 min
| Superset | Exercise A | Exercise B | Sets × Reps |
|----------|------------|------------|-------------|
| 1 | Flat DB bench press | Cable lateral raise | 3 × 8–12 / 3 × 12–15 |
| 2 | Incline DB press | Cable tricep pushdown (rope) | 3 × 10–12 / 3 × 12–15 |
| 3 | Cable chest fly (mid pulley) | Seated DB shoulder press | 3 × 12–15 / 3 × 10–12 |

### Day B — Pull (Back, Biceps, Rear Delts) ~30 min
| Superset | Exercise A | Exercise B | Sets × Reps |
|----------|------------|------------|-------------|
| 1 | Pull-ups (or band-assisted) | Cable face pull (rope, high pulley) | 3 × max / 3 × 15 |
| 2 | Cable seated row | Cable bicep curl (bar) | 3 × 10–12 / 3 × 12 |
| 3 | Cable single-arm row | DB hammer curl | 3 × 12 each / 2 × 12 |

### Day C — Legs + Core ~30 min
| Superset | Exercise A | Exercise B | Sets × Reps |
|----------|------------|------------|-------------|
| 1 | DB goblet squat | Hanging leg raise | 3 × 12 / 3 × max |
| 2 | DB Romanian deadlift | Ab station knee raise | 3 × 10–12 / 3 × 15 |
| 3 | Cable glute kickback | Dips (bodyweight or band) | 3 × 12 each / 3 × max |

### Cycling (Optional)
Log: **duration** (min), **distance** (km), **calories** (bike display). Logged separately as a cardio session.

---

## Progressive Overload Logic

Uses **double progression**:

1. Target rep range shown per exercise (e.g. 3 × 8–12)
2. Complete all sets at the **top** of the range → app suggests +2.5kg next session
3. **To failure toggle** per set — if marked and failed → hold weight, aim to improve reps
4. **Deload trigger**: fail same weight 2 sessions in a row → app prompts deload week (-20% weight)
5. **Previous session always visible** while logging — pre-filled at last weight/reps

---

## Form Guides

Each exercise includes an info panel (tap ℹ icon — doesn't interrupt logging):

- **Muscles worked** (primary + secondary)
- **Setup** (1–2 sentences: position, grip, start point)
- **3 key cues** (what to focus on during the movement)
- **2–3 common mistakes** to avoid
- **Cable note** where relevant (pulley height, attachment)

---

## App Features — Phased Build

### Phase 1 — Workout Tracker (primary focus)
- [ ] Exercise library with form guides (pre-loaded with above split)
- [ ] Workout logging: sets × reps × weight, "to failure" toggle
- [ ] Superset mode — exercises grouped, alternating sets with shared rest timer
- [ ] Previous session pre-filled when workout opens
- [ ] Progressive overload suggestion shown before each exercise
- [ ] Auto rest timer (60s, starts after each set logged; configurable)
- [ ] Session duration tracker
- [ ] Workout history (calendar + list view)
- [ ] Body weight + VeSync metrics log (manual entry)
- [ ] 7-day rolling average weight chart
- [ ] Cycling session log (time, distance, calories)

### Phase 2 — Nutrition (included from start, secondary focus)
- [ ] Daily calorie + macro log (protein / carbs / fat)
- [ ] TDEE display (based on current weight, height, activity)
- [ ] Macro targets with progress bars (protein prioritised)
- [ ] Quick-add common meals
- [ ] Weekly calorie summary
- [ ] Calorie vs. weight trend chart

### Phase 3 — Intelligence Layer (later)
- [ ] Deload detection + prompt
- [ ] Weekly volume per muscle group vs. recommended range
- [ ] 1RM estimator (Epley formula)
- [ ] Strength standards by bodyweight
- [ ] VeSync CSV import

---

## Data Model (IndexedDB)

```
exercises        { id, name, muscleGroup, equipment, formGuide{} }
workouts         { id, date, type, notes, durationMin }
sets             { id, workoutId, exerciseId, setNumber, reps, weight, toFailure }
cyclingSession   { id, date, durationMin, distanceKm, caloriesBurnt, notes }
bodyMetrics      { id, date, weight, bodyFat, muscleMass, visceralFat, ... }
nutritionLog     { id, date, calories, protein, carbs, fat, notes }
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI | HTML / CSS / JS (no framework) |
| Storage | IndexedDB (via idb wrapper) |
| PWA | Service Worker + manifest |
| Charts | Chart.js (CDN) |
| Deployment | GitHub Pages → Android "Add to Home Screen" |

---

## UI / UX

- Dark mode default (gym lighting)
- Large tap targets (min 44px)
- One-handed use — primary actions bottom of screen
- Zero friction: last session pre-filled, tap to adjust, tap to confirm
- Rest timer auto-starts after each set
- Form guide on demand (info icon, non-intrusive)
- PWA install prompt on first visit

---

## Nutrition: Meal Plan Foundations

**Target:** ~2,200 kcal, ~200g protein/day

| Meal | Example | Kcal | Protein |
|------|---------|------|---------|
| Breakfast | 4-egg omelette + oats | ~500 | ~45g |
| Lunch | Air fryer chicken thighs + rice + veg | ~600 | ~50g |
| Dinner | Salmon fillet + sweet potato + greens | ~600 | ~45g |
| Snacks | Greek yoghurt + cottage cheese | ~500 | ~60g |

Batch-cook Sunday → 3 days of lunches/dinners.

---

## Context Window Handoff Template

If context is running low, update this section and give the user the following prompt:

> "We're building a PWA gym tracker called Lewis's Training Log.
> Project guide is at `/home/lewis/Documents/gym-app/PROJECT.md` — read that first.
> Stack: HTML/CSS/JS, IndexedDB, Chart.js, GitHub Pages.
> Current build status: [UPDATE THIS].
> Next task: [UPDATE THIS]."

---

## Next Steps

1. ✅ Split confirmed — Push/Pull/Legs+Core, 3 superset pairs/session, ~30 min
2. ✅ Cycling: time + distance + calories
3. ✅ VeSync: manual entry (Phase 3: CSV import)
4. ✅ Form guides: info panel per exercise
5. ✅ Nutrition included from start, workout as primary focus
6. ✅ Deployment: GitHub Pages
7. **→ Ready to build Phase 1 PWA**
