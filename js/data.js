const EXERCISES = {
  'db-bench-press': {
    name: 'Flat DB Bench Press',
    muscles: 'Chest (primary) · Front Delt · Triceps',
    equipment: 'Bench + Dumbbells',
    repsMin: 8, repsMax: 12,
    formGuide: {
      setup: 'Lie flat on bench. Dumbbells at chest height, palms facing forward, elbows at ~45° to body.',
      cues: ['Drive feet into floor, slight arch in lower back', 'Press up and slightly inward — dumbbells nearly touch at top', 'Lower slowly: 2–3 seconds down'],
      mistakes: ['Flaring elbows out to 90° (shoulder injury risk)', 'Bouncing off chest', 'Letting dumbbells drift too wide on descent']
    }
  },
  'cable-lateral-raise': {
    name: 'Cable Lateral Raise',
    muscles: 'Side Delt (primary)',
    equipment: 'Cable (low pulley, D-handle)',
    repsMin: 12, repsMax: 15,
    formGuide: {
      setup: 'Stand side-on to cable, handle in far hand. Slight bend in elbow. Start with arm across body.',
      cues: ['Raise arm to shoulder height — no higher', 'Lead with elbow, not wrist', 'Slow on the way down: 2–3 seconds'],
      mistakes: ['Shrugging shoulders up', 'Using momentum or body swing', 'Raising above shoulder height']
    }
  },
  'incline-db-press': {
    name: 'Incline DB Press',
    muscles: 'Upper Chest (primary) · Front Delt · Triceps',
    equipment: 'Incline Bench + Dumbbells',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Set bench to 30–45°. Dumbbells at chest height, same grip as flat press.',
      cues: ['Keep chest proud — don\'t let shoulders round forward', 'Press up and slightly inward', 'Control the descent'],
      mistakes: ['Bench too steep (becomes a shoulder press)', 'Losing chest contact at top', 'Going too heavy before the movement is dialled in']
    }
  },
  'cable-tricep-pushdown': {
    name: 'Cable Tricep Pushdown',
    muscles: 'Triceps (all heads)',
    equipment: 'Cable (high pulley, rope attachment)',
    repsMin: 12, repsMax: 15,
    formGuide: {
      setup: 'High pulley, rope attachment. Stand close, elbows pinned to sides, slight forward lean.',
      cues: ['Elbows stay fixed — only forearms move', 'Spread the rope apart at the bottom', 'Full extension at bottom of each rep'],
      mistakes: ['Letting elbows drift forward mid-set', 'Using body weight to push down', 'Short range of motion']
    }
  },
  'cable-chest-fly': {
    name: 'Cable Chest Fly',
    muscles: 'Chest (pec major) · Front Delt',
    equipment: 'Cable (mid pulley, D-handles)',
    repsMin: 12, repsMax: 15,
    formGuide: {
      setup: 'Set both pulleys to mid-chest height. Stand central, slight forward lean, soft bend in elbows.',
      cues: ['Squeeze like hugging a tree — arc the movement inward', 'Lead with elbows, not wrists', 'Slow on the return: 2–3 seconds'],
      mistakes: ['Letting elbows drop below shoulder height', 'Going too heavy (turns into a press)', 'Crashing hands together at centre']
    }
  },
  'seated-db-shoulder-press': {
    name: 'Seated DB Shoulder Press',
    muscles: 'Deltoids (all heads) · Triceps',
    equipment: 'Bench (upright) + Dumbbells',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Set bench upright (90°). Dumbbells at ear height, palms facing forward.',
      cues: ['Press straight up — don\'t let dumbbells arc inward', 'Keep core braced, avoid arching lower back', 'Lower to just below ear height for full range'],
      mistakes: ['Arching lower back excessively', 'Locking out aggressively at top', 'Dumbbells positioned too wide']
    }
  },
  'band-lat-pulldown': {
    name: 'Band Lat Pulldown',
    muscles: 'Lats (primary) · Biceps · Rear Delt',
    equipment: 'Resistance band over pull-up bar',
    repsMin: 12, repsMax: 15,
    formGuide: {
      setup: 'Loop a resistance band over the pull-up bar. Kneel or sit on floor beneath it. Grip the band wide, palms facing you.',
      cues: ['Drive elbows down and back — think "elbows to hip pockets"', 'Lean back slightly, chest up throughout', 'Squeeze lats at the bottom, slow return up'],
      mistakes: ['Pulling with biceps only', 'Rounding shoulders forward at the bottom', 'Using a band with too little resistance'],
      note: 'This builds directly toward unassisted pull-ups. Progress by using a thinner/lighter band over time, then move to the bar.'
    }
  },
  'cable-face-pull': {
    name: 'Cable Face Pull',
    muscles: 'Rear Delt (primary) · Rotator Cuff · Traps',
    equipment: 'Cable (high pulley, rope attachment)',
    repsMin: 15, repsMax: 20,
    formGuide: {
      setup: 'High pulley with rope. Stand back, arms extended. Pull toward face — rope splits either side of your head.',
      cues: ['Elbows stay high — parallel to floor or higher', 'External rotate at the end: hands go back, elbows forward', 'Pause at peak contraction for 1 second'],
      mistakes: ['Elbows dropping (turns it into a row)', 'Going too heavy', 'Not completing the rotation at the end']
    }
  },
  'cable-seated-row': {
    name: 'Cable Seated Row',
    muscles: 'Mid Back (primary) · Lats · Biceps',
    equipment: 'Cable (mid pulley, close-grip handle)',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Sit facing cable, mid pulley. Slight bend in knees. Pull handle to lower chest / upper abdomen.',
      cues: ['Drive elbows back, squeeze shoulder blades together at end', 'Keep torso upright — minimal rocking', 'Full stretch on return: let shoulders protract forward'],
      mistakes: ['Leaning back excessively to move weight', 'Pulling with arms only, not engaging the back', 'Jerking the weight off the stack']
    }
  },
  'cable-bicep-curl': {
    name: 'Cable Bicep Curl',
    muscles: 'Biceps (long + short head)',
    equipment: 'Cable (low pulley, straight bar)',
    repsMin: 12, repsMax: 15,
    formGuide: {
      setup: 'Low pulley, straight bar. Stand close, elbows pinned to sides.',
      cues: ['Full range — fully extend at bottom, squeeze hard at top', 'Elbows stay fixed at sides throughout', 'Slow on the way down: 2–3 seconds'],
      mistakes: ['Swinging torso to lift', 'Partial reps', 'Elbows drifting forward']
    }
  },
  'cable-single-arm-row': {
    name: 'Cable Single-Arm Row',
    muscles: 'Lats · Mid Back · Rear Delt',
    equipment: 'Cable (mid pulley, D-handle)',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Stand in split stance facing cable. Pull D-handle to hip/waist.',
      cues: ['Drive elbow back past your body', 'Slight torso rotation allowed — don\'t overdo it', 'Full stretch: reach arm forward on return'],
      mistakes: ['Pulling with bicep only', 'Excessive body rotation', 'Not reaching full extension on return']
    }
  },
  'db-hammer-curl': {
    name: 'DB Hammer Curl',
    muscles: 'Biceps (long head) · Brachialis · Forearms',
    equipment: 'Dumbbells',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Stand, dumbbells at sides, palms facing each other (neutral grip). Elbows pinned.',
      cues: ['Curl up keeping palms neutral throughout — don\'t rotate', 'Squeeze at the top', 'Full extension at the bottom'],
      mistakes: ['Rotating to a supinated grip (that\'s a regular curl)', 'Swinging body for momentum', 'Short range of motion']
    }
  },
  'db-goblet-squat': {
    name: 'DB Goblet Squat',
    muscles: 'Quads (primary) · Glutes · Core',
    equipment: 'Single Dumbbell',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Hold one dumbbell vertically at chest (goblet position). Feet shoulder-width, toes slightly turned out.',
      cues: ['Sit between your knees, not behind them', 'Chest up throughout — don\'t collapse forward', 'Drive through heels to stand'],
      mistakes: ['Heels lifting off the floor', 'Torso collapsing forward', 'Knees caving inward']
    }
  },
  'hanging-leg-raise': {
    name: 'Hanging Leg Raise',
    muscles: 'Lower Abs (primary) · Hip Flexors · Core',
    equipment: 'Pull-up bar',
    repsMin: 6, repsMax: 12,
    formGuide: {
      setup: 'Hang from pull-up bar, arms fully extended. Brace core before moving.',
      cues: ['Tuck pelvis under at the top (posterior tilt)', 'Control the descent — no swinging', 'Breathe out on the way up'],
      mistakes: ['Swinging for momentum', 'Only raising to 90° — aim to go higher', 'Relaxing abs at the bottom'],
      note: 'Start with knees bent if straight-leg is too difficult. Progress to straight legs over time.'
    }
  },
  'db-rdl': {
    name: 'DB Romanian Deadlift',
    muscles: 'Hamstrings (primary) · Glutes · Lower Back',
    equipment: 'Dumbbells',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Stand tall, dumbbells in front of thighs. Maintain a soft bend in knees throughout.',
      cues: ['Hinge at hips — push them back, not down', 'Keep dumbbells close to legs as you lower', 'Feel the hamstring stretch, then drive hips forward to stand'],
      mistakes: ['Bending knees too much (becomes a squat)', 'Rounding the lower back', 'Going lower than hamstring flexibility allows']
    }
  },
  'ab-knee-raise': {
    name: 'Ab Station Knee Raise',
    muscles: 'Lower Abs · Hip Flexors',
    equipment: 'Ab raise / dip station',
    repsMin: 12, repsMax: 20,
    formGuide: {
      setup: 'Forearms on pads, back against backrest. Let legs hang fully.',
      cues: ['Curl knees toward chest — round your lower back at the top', 'Don\'t just lift knees to 90°: really crunch the abs', 'Slow and controlled on the way down'],
      mistakes: ['Hip flexors only — no ab engagement', 'Swinging legs', 'Not achieving posterior pelvic tilt at the top']
    }
  },
  'cable-glute-kickback': {
    name: 'Cable Glute Kickback',
    muscles: 'Glutes (primary) · Hamstrings',
    equipment: 'Cable (low pulley, ankle strap)',
    repsMin: 10, repsMax: 12,
    formGuide: {
      setup: 'Attach ankle strap to low pulley. Face cable, slight forward lean, hold machine for balance.',
      cues: ['Squeeze glute hard at the top of the movement', 'Keep hips square — don\'t rotate', 'Focus on the contraction, not the range'],
      mistakes: ['Swinging leg for momentum', 'Rotating hips to get more range', 'Going too heavy — this is an isolation exercise']
    }
  },
  'dips': {
    name: 'Dips',
    muscles: 'Triceps (primary) · Chest · Front Delt',
    equipment: 'Dip station',
    repsMin: 6, repsMax: 15,
    formGuide: {
      setup: 'Grip parallel bars, arms extended. Slight forward lean for more chest; stay upright for more triceps.',
      cues: ['Lower until upper arms are parallel to floor', 'Drive up through your palms', 'Keep core braced throughout'],
      mistakes: ['Going too deep (shoulder strain risk)', 'Flaring elbows excessively', 'Using momentum'],
      note: 'Use a resistance band looped under your feet for assistance. Reduce band thickness over time as you get stronger.'
    }
  }
};

const PROGRAMS = [
  {
    id: 'push',
    name: 'Day A — Push',
    emoji: '💪',
    muscles: 'Chest · Shoulders · Triceps',
    pairs: [
      ['db-bench-press',      'cable-lateral-raise'],
      ['incline-db-press',    'cable-tricep-pushdown'],
      ['cable-chest-fly',     'seated-db-shoulder-press']
    ]
  },
  {
    id: 'pull',
    name: 'Day B — Pull',
    emoji: '🔙',
    muscles: 'Back · Biceps · Rear Delts',
    pairs: [
      ['band-lat-pulldown',   'cable-face-pull'],
      ['cable-seated-row',    'cable-bicep-curl'],
      ['cable-single-arm-row','db-hammer-curl']
    ]
  },
  {
    id: 'legs',
    name: 'Day C — Legs + Core',
    emoji: '🦵',
    muscles: 'Quads · Hamstrings · Glutes · Core',
    pairs: [
      ['db-goblet-squat',     'hanging-leg-raise'],
      ['db-rdl',              'ab-knee-raise'],
      ['cable-glute-kickback','dips']
    ]
  }
];
