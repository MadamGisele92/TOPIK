const LEVELS = 6;
const LESSONS_PER_LEVEL = 15;

const levelFocus = {
  1: 'Survival Korean: Hangul, greetings, numbers, daily basics',
  2: 'Everyday communication: routines, locations, shopping, plans',
  3: 'Intermediate expression: opinions, comparisons, social interactions',
  4: 'Advanced fluency: abstract topics, media, nuanced grammar',
  5: 'Professional & academic Korean: analysis, persuasion, formal contexts',
  6: 'Near-native performance: debate, writing precision, cultural nuance'
};

const themes = [
  'Café Date', 'Campus Life', 'Subway Quest', 'Workplace Team', 'Travel Day',
  'Health Clinic', 'Family Celebration', 'Shopping Mission', 'Cultural Festival',
  'Study Group', 'House Hunt', 'Restaurant Challenge', 'Interview Prep',
  'News & Opinions', 'Future Dreams'
];

const vocabBank = {
  'Café Date': [['커피', 'coffee'], ['달콤하다', 'sweet'], ['주문하다', 'to order']],
  'Campus Life': [['수업', 'class'], ['과제', 'assignment'], ['도서관', 'library']],
  'Subway Quest': [['출구', 'exit'], ['환승', 'transfer'], ['지하철', 'subway']],
  'Workplace Team': [['회의', 'meeting'], ['프로젝트', 'project'], ['협력', 'cooperation']],
  'Travel Day': [['여행', 'trip'], ['지도', 'map'], ['예약', 'reservation']],
  'Health Clinic': [['진료', 'consultation'], ['통증', 'pain'], ['약국', 'pharmacy']],
  'Family Celebration': [['생일', 'birthday'], ['축하하다', 'to celebrate'], ['선물', 'gift']],
  'Shopping Mission': [['할인', 'discount'], ['환불', 'refund'], ['가격', 'price']],
  'Cultural Festival': [['공연', 'performance'], ['전통', 'tradition'], ['축제', 'festival']],
  'Study Group': [['복습', 'review'], ['발표', 'presentation'], ['토론', 'discussion']],
  'House Hunt': [['계약', 'contract'], ['월세', 'monthly rent'], ['이사', 'move']],
  'Restaurant Challenge': [['메뉴', 'menu'], ['추천', 'recommendation'], ['계산서', 'bill']],
  'Interview Prep': [['면접', 'interview'], ['강점', 'strength'], ['경험', 'experience']],
  'News & Opinions': [['기사', 'article'], ['관점', 'point of view'], ['정책', 'policy']],
  'Future Dreams': [['목표', 'goal'], ['계획', 'plan'], ['성장', 'growth']]
};

const encouragements = [
  'Great choice! TOPIK stars are aligning for you 🌟',
  'You are leveling up beautifully, keep going!',
  'Bori says: one lesson at a time to fluency 💗',
  'Fantastic focus! Your Korean confidence is blooming.',
  'Brilliant effort! Let’s ace the next challenge.'
];

const appState = {
  curriculum: [],
  selectedLesson: null,
  flashIndex: 0,
  memory: { cards: [], first: null, second: null, lock: false, matches: 0 },
  progress: JSON.parse(localStorage.getItem('topikQuestProgress') || '{}')
};

const el = {
  levelList: document.getElementById('levelList'),
  completedLessons: document.getElementById('completedLessons'),
  globalProgress: document.getElementById('globalProgress'),
  lessonPath: document.getElementById('lessonPath'),
  lessonTitle: document.getElementById('lessonTitle'),
  lessonTheme: document.getElementById('lessonTheme'),
  activityGrid: document.getElementById('activityGrid'),
  completeBtn: document.getElementById('completeBtn'),
  mascotSpeech: document.getElementById('mascotSpeech'),
  flashPrompt: document.getElementById('flashPrompt'),
  flashAnswer: document.getElementById('flashAnswer'),
  flashNext: document.getElementById('flashNext'),
  memoryBoard: document.getElementById('memoryBoard'),
  memoryStatus: document.getElementById('memoryStatus'),
  fillSentence: document.getElementById('fillSentence'),
  fillInput: document.getElementById('fillInput'),
  fillCheck: document.getElementById('fillCheck'),
  fillResult: document.getElementById('fillResult'),
  scenarioPrompt: document.getElementById('scenarioPrompt'),
  scenarioChoices: document.getElementById('scenarioChoices'),
  scenarioResult: document.getElementById('scenarioResult')
};

function buildCurriculum() {
  const curriculum = [];
  for (let lvl = 1; lvl <= LEVELS; lvl += 1) {
    const lessons = [];
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx += 1) {
      const theme = themes[idx % themes.length];
      const vocab = vocabBank[theme];
      const [k1, k2, k3] = vocab;
      lessons.push({
        id: `L${lvl}-${idx + 1}`,
        level: lvl,
        order: idx + 1,
        title: `${theme} ${lvl}.${idx + 1}`,
        focus: `${levelFocus[lvl]} · ${theme}`,
        flashcards: vocab,
        fill: {
          sentence: `I want to ${k1[1]} today: 오늘 ___ 마시고 싶어요.`,
          answer: k1[0]
        },
        scenario: {
          prompt: `Scenario: You are in "${theme}". Which phrase is the best response?`,
          options: [
            { text: `${k2[0]}에 대해 이야기해요.`, correct: true },
            { text: '날씨가 우주예요.', correct: false },
            { text: '고양이는 수학을 먹어요.', correct: false }
          ]
        },
        proficiencyGoal: `By the end of this lesson, you can use ${k1[0]}, ${k2[0]}, and ${k3[0]} in practical context.`
      });
    }
    curriculum.push({ level: lvl, description: levelFocus[lvl], lessons });
  }
  return curriculum;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function saveProgress() {
  localStorage.setItem('topikQuestProgress', JSON.stringify(appState.progress));
}

function refreshProgressUI() {
  const doneCount = Object.values(appState.progress).filter(Boolean).length;
  el.completedLessons.textContent = doneCount;
  const percent = Math.round((doneCount / (LEVELS * LESSONS_PER_LEVEL)) * 100);
  el.globalProgress.style.width = `${percent}%`;
}

function renderSidebar() {
  el.levelList.innerHTML = '';
  appState.curriculum.forEach((group) => {
    const wrap = document.createElement('div');
    wrap.className = 'level-group';
    wrap.innerHTML = `<h3>TOPIK ${group.level}</h3><p class="small">${group.description}</p>`;

    group.lessons.forEach((lesson) => {
      const btn = document.createElement('button');
      btn.className = 'lesson-btn';
      if (appState.progress[lesson.id]) btn.classList.add('done');
      if (appState.selectedLesson?.id === lesson.id) btn.classList.add('active');
      btn.textContent = `${lesson.order}. ${lesson.title}`;
      btn.addEventListener('click', () => selectLesson(lesson));
      wrap.appendChild(btn);
    });

    el.levelList.appendChild(wrap);
  });
}

function selectLesson(lesson) {
  appState.selectedLesson = lesson;
  appState.flashIndex = 0;
  el.lessonPath.textContent = `TOPIK ${lesson.level} · Lesson ${lesson.order}`;
  el.lessonTitle.textContent = lesson.title;
  el.lessonTheme.textContent = `${lesson.focus}. ${lesson.proficiencyGoal}`;
  el.completeBtn.disabled = false;
  el.activityGrid.classList.remove('hidden');
  el.mascotSpeech.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];

  initFlashcards();
  initMemoryGame();
  initFillBlank();
  initScenario();
  renderSidebar();
}

function initFlashcards() {
  const lesson = appState.selectedLesson;
  const card = lesson.flashcards[appState.flashIndex % lesson.flashcards.length];
  el.flashPrompt.textContent = `Card ${appState.flashIndex + 1} of ${lesson.flashcards.length}`;
  el.flashAnswer.textContent = `${card[0]} · ${card[1]}`;
}

function initMemoryGame() {
  const lesson = appState.selectedLesson;
  const source = lesson.flashcards.slice(0, 3);
  const cards = shuffle([
    ...source.map(([korean, english], idx) => ({ key: idx, label: korean })),
    ...source.map(([korean, english], idx) => ({ key: idx, label: english }))
  ]).map((card, idx) => ({ ...card, id: idx, matched: false, revealed: false }));

  appState.memory = { cards, first: null, second: null, lock: false, matches: 0 };
  drawMemoryBoard();
}

function drawMemoryBoard() {
  el.memoryBoard.innerHTML = '';
  appState.memory.cards.forEach((card) => {
    const btn = document.createElement('button');
    btn.className = 'memory-card';
    if (card.revealed) btn.classList.add('revealed');
    if (card.matched) btn.classList.add('matched');
    btn.textContent = card.revealed || card.matched ? card.label : '❔';
    btn.disabled = card.matched || appState.memory.lock;
    btn.addEventListener('click', () => chooseMemoryCard(card.id));
    el.memoryBoard.appendChild(btn);
  });
  el.memoryStatus.textContent = `Matches: ${appState.memory.matches}/3`;
}

function chooseMemoryCard(id) {
  const game = appState.memory;
  if (game.lock) return;
  const card = game.cards.find((c) => c.id === id);
  if (!card || card.revealed || card.matched) return;

  card.revealed = true;
  if (game.first === null) {
    game.first = card;
    drawMemoryBoard();
    return;
  }

  game.second = card;
  game.lock = true;
  drawMemoryBoard();

  const isMatch = game.first.key === game.second.key;
  setTimeout(() => {
    if (isMatch) {
      game.first.matched = true;
      game.second.matched = true;
      game.matches += 1;
    } else {
      game.first.revealed = false;
      game.second.revealed = false;
    }
    game.first = null;
    game.second = null;
    game.lock = false;
    drawMemoryBoard();
  }, 600);
}

function initFillBlank() {
  const fill = appState.selectedLesson.fill;
  el.fillSentence.textContent = fill.sentence;
  el.fillInput.value = '';
  el.fillResult.textContent = '';
}

function initScenario() {
  const scenario = appState.selectedLesson.scenario;
  el.scenarioPrompt.textContent = scenario.prompt;
  el.scenarioChoices.innerHTML = '';
  el.scenarioResult.textContent = '';

  shuffle(scenario.options).forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = option.text;
    btn.addEventListener('click', () => {
      el.scenarioResult.textContent = option.correct
        ? 'Correct! Natural, useful Korean for this context.'
        : 'Not quite—try the expression that best matches the scene.';
      el.scenarioResult.style.color = option.correct ? '#3f8f65' : '#b55463';
    });
    el.scenarioChoices.appendChild(btn);
  });
}

el.flashNext.addEventListener('click', () => {
  if (!appState.selectedLesson) return;
  appState.flashIndex += 1;
  initFlashcards();
});

el.fillCheck.addEventListener('click', () => {
  if (!appState.selectedLesson) return;
  const expected = appState.selectedLesson.fill.answer.trim();
  const provided = el.fillInput.value.trim();
  const success = provided === expected;
  el.fillResult.textContent = success
    ? 'Perfect! You nailed that vocabulary.'
    : `Try again. Correct answer: ${expected}`;
  el.fillResult.style.color = success ? '#3f8f65' : '#b55463';
});

el.completeBtn.addEventListener('click', () => {
  if (!appState.selectedLesson) return;
  appState.progress[appState.selectedLesson.id] = true;
  saveProgress();
  refreshProgressUI();
  renderSidebar();
  el.mascotSpeech.textContent = 'Amazing! You are one step closer to TOPIK mastery 🏆';
});

function init() {
  appState.curriculum = buildCurriculum();
  renderSidebar();
  refreshProgressUI();
}

init();
