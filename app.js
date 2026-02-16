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
  'Study Group', 'House Hunt', 'Restaurant Challenge', 'Interview Prep', 'News & Opinions', 'Future Dreams'
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
  'Legendary move! Your Korean power is rising. 🌟',
  'Bori cheers: keep the streak alive! 🔥',
  'Awesome questing! You are getting closer to TOPIK mastery.',
  'Beautiful focus! Let us conquer the next challenge.',
  'You are unstoppable today. Korean confidence unlocked!'
];

const state = {
  curriculum: [],
  selectedLesson: null,
  flashIndex: 0,
  flashRevealed: false,
  memory: { cards: [], first: null, second: null, lock: false, matches: 0 },
  profile: JSON.parse(localStorage.getItem('topikQuestProfile') || '{"xp":0,"coins":0,"streak":0,"hearts":5}'),
  progress: JSON.parse(localStorage.getItem('topikQuestProgress') || '{}')
};

const el = {
  tabs: [...document.querySelectorAll('.tab')],
  pages: [...document.querySelectorAll('.page')],
  worldGrid: document.getElementById('worldGrid'),
  lessonList: document.getElementById('lessonList'),
  lessonPath: document.getElementById('lessonPath'),
  lessonTitle: document.getElementById('lessonTitle'),
  lessonFocus: document.getElementById('lessonFocus'),
  completeLessonBtn: document.getElementById('completeLessonBtn'),
  xpValue: document.getElementById('xpValue'),
  coinValue: document.getElementById('coinValue'),
  streakValue: document.getElementById('streakValue'),
  heartsValue: document.getElementById('heartsValue'),
  mascotSpeech: document.getElementById('mascotSpeech'),
  flashPrompt: document.getElementById('flashPrompt'),
  flashFront: document.getElementById('flashFront'),
  flashBack: document.getElementById('flashBack'),
  revealFlashBtn: document.getElementById('revealFlashBtn'),
  nextFlashBtn: document.getElementById('nextFlashBtn'),
  memoryBoard: document.getElementById('memoryBoard'),
  memoryStatus: document.getElementById('memoryStatus'),
  blankSentence: document.getElementById('blankSentence'),
  blankInput: document.getElementById('blankInput'),
  checkBlankBtn: document.getElementById('checkBlankBtn'),
  blankResult: document.getElementById('blankResult'),
  scenarioPrompt: document.getElementById('scenarioPrompt'),
  scenarioChoices: document.getElementById('scenarioChoices'),
  scenarioResult: document.getElementById('scenarioResult')
};

function buildCurriculum() {
  const output = [];
  for (let lvl = 1; lvl <= LEVELS; lvl += 1) {
    const lessons = [];
    for (let i = 0; i < LESSONS_PER_LEVEL; i += 1) {
      const theme = themes[i % themes.length];
      const [k1, k2, k3] = vocabBank[theme];
      lessons.push({
        id: `L${lvl}-${i + 1}`,
        level: lvl,
        order: i + 1,
        theme,
        title: `${theme} ${lvl}.${i + 1}`,
        focus: `${levelFocus[lvl]} • ${theme}`,
        flashcards: vocabBank[theme],
        fill: { sentence: `오늘 ___ 연습해요. (practice ${k1[1]})`, answer: k1[0] },
        scenario: {
          prompt: `You are in ${theme}. Pick the most natural Korean response:`,
          options: [
            { text: `${k2[0]}에 대해 이야기해요.`, correct: true },
            { text: '공룡이 냉장고를 운전해요.', correct: false },
            { text: '바다는 숙제를 먹어요.', correct: false }
          ]
        }
      });
    }
    output.push({ level: lvl, description: levelFocus[lvl], lessons });
  }
  return output;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function saveAll() {
  localStorage.setItem('topikQuestProfile', JSON.stringify(state.profile));
  localStorage.setItem('topikQuestProgress', JSON.stringify(state.progress));
}

function addRewards({ xp = 0, coins = 0, streak = 0, hearts = 0 }) {
  state.profile.xp += xp;
  state.profile.coins += coins;
  state.profile.streak = Math.max(0, state.profile.streak + streak);
  state.profile.hearts = Math.min(5, Math.max(0, state.profile.hearts + hearts));
  saveAll();
  renderHud();
}

function renderHud() {
  el.xpValue.textContent = state.profile.xp;
  el.coinValue.textContent = state.profile.coins;
  el.streakValue.textContent = state.profile.streak;
  el.heartsValue.textContent = state.profile.hearts;
}

function worldProgress(level) {
  const keys = Array.from({ length: LESSONS_PER_LEVEL }, (_, i) => `L${level}-${i + 1}`);
  const done = keys.filter((id) => state.progress[id]).length;
  return { done, total: LESSONS_PER_LEVEL, percent: Math.round((done / LESSONS_PER_LEVEL) * 100) };
}

function renderWorldMap() {
  el.worldGrid.innerHTML = '';
  state.curriculum.forEach((world) => {
    const progress = worldProgress(world.level);
    const card = document.createElement('article');
    card.className = 'world-card';
    card.innerHTML = `
      <h3>TOPIK ${world.level}</h3>
      <p class="small">${world.description}</p>
      <p><strong>${progress.done}/${progress.total}</strong> quests cleared</p>
      <div class="track"><span style="width:${progress.percent}%"></span></div>
      <button class="btn gold" data-level="${world.level}">Enter World ${world.level}</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      const firstOpen = world.lessons.find((lesson) => !state.progress[lesson.id]) || world.lessons[0];
      selectLesson(firstOpen);
      switchPage('lessonPage');
    });
    el.worldGrid.appendChild(card);
  });
}

function renderLessonHub() {
  el.lessonList.innerHTML = '';
  state.curriculum.forEach((group) => {
    const section = document.createElement('div');
    section.className = 'lesson-level';
    section.innerHTML = `<h3>TOPIK ${group.level}</h3><p class="small">${group.description}</p>`;

    group.lessons.forEach((lesson) => {
      const button = document.createElement('button');
      button.className = 'lesson-btn';
      if (state.selectedLesson?.id === lesson.id) button.classList.add('active');
      if (state.progress[lesson.id]) button.classList.add('done');
      button.textContent = `${lesson.order}. ${lesson.title}`;
      button.addEventListener('click', () => selectLesson(lesson));
      section.appendChild(button);
    });

    el.lessonList.appendChild(section);
  });
}

function selectLesson(lesson) {
  state.selectedLesson = lesson;
  state.flashIndex = 0;
  state.flashRevealed = false;
  el.lessonPath.textContent = `TOPIK ${lesson.level} • Lesson ${lesson.order}`;
  el.lessonTitle.textContent = lesson.title;
  el.lessonFocus.textContent = lesson.focus;
  el.completeLessonBtn.disabled = false;
  el.mascotSpeech.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];
  renderLessonHub();
  initFlashArena();
  initMemoryTemple();
  initBlankForge();
  initScenarioTheater();
}

function initFlashArena() {
  if (!state.selectedLesson) {
    el.flashPrompt.textContent = 'Select a lesson first.';
    el.flashFront.textContent = '—';
    el.flashBack.textContent = '—';
    return;
  }
  const cards = state.selectedLesson.flashcards;
  const [korean, english] = cards[state.flashIndex % cards.length];
  el.flashPrompt.textContent = `${state.selectedLesson.title} • Card ${state.flashIndex + 1}/${cards.length}`;
  el.flashFront.textContent = korean;
  el.flashBack.textContent = state.flashRevealed ? english : '???';
}

function initMemoryTemple() {
  if (!state.selectedLesson) {
    el.memoryBoard.innerHTML = '';
    el.memoryStatus.textContent = 'Matches: 0/3';
    return;
  }

  const source = state.selectedLesson.flashcards.slice(0, 3);
  const cards = shuffle([
    ...source.map(([ko], idx) => ({ key: idx, label: ko })),
    ...source.map(([, en], idx) => ({ key: idx, label: en }))
  ]).map((card, id) => ({ ...card, id, revealed: false, matched: false }));

  state.memory = { cards, first: null, second: null, lock: false, matches: 0 };
  drawMemory();
}

function drawMemory() {
  el.memoryBoard.innerHTML = '';
  state.memory.cards.forEach((card) => {
    const b = document.createElement('button');
    b.className = 'memory-card';
    if (card.revealed) b.classList.add('revealed');
    if (card.matched) b.classList.add('matched');
    b.textContent = (card.revealed || card.matched) ? card.label : '❔';
    b.disabled = card.matched || state.memory.lock;
    b.addEventListener('click', () => flipMemoryCard(card.id));
    el.memoryBoard.appendChild(b);
  });
  el.memoryStatus.textContent = `Matches: ${state.memory.matches}/3`;
}

function flipMemoryCard(id) {
  if (!state.selectedLesson) return;
  if (state.memory.lock) return;
  const card = state.memory.cards.find((item) => item.id === id);
  if (!card || card.revealed || card.matched) return;

  card.revealed = true;
  if (!state.memory.first) {
    state.memory.first = card;
    drawMemory();
    return;
  }

  state.memory.second = card;
  state.memory.lock = true;
  drawMemory();

  const matched = state.memory.first.key === state.memory.second.key;
  setTimeout(() => {
    if (matched) {
      state.memory.first.matched = true;
      state.memory.second.matched = true;
      state.memory.matches += 1;
      addRewards({ xp: 8, coins: 3, streak: 1 });
      if (state.memory.matches === 3) {
        addRewards({ xp: 20, coins: 10, streak: 2 });
        el.mascotSpeech.textContent = 'Memory Temple cleared! Bonus rewards unlocked 🧠✨';
      }
    } else {
      state.memory.first.revealed = false;
      state.memory.second.revealed = false;
      addRewards({ hearts: -1, streak: -1 });
    }

    state.memory.first = null;
    state.memory.second = null;
    state.memory.lock = false;
    drawMemory();
  }, 550);
}

function initBlankForge() {
  if (!state.selectedLesson) {
    el.blankSentence.textContent = 'Choose a lesson to begin.';
    el.blankInput.value = '';
    el.blankResult.textContent = '';
    return;
  }
  el.blankSentence.textContent = state.selectedLesson.fill.sentence;
  el.blankInput.value = '';
  el.blankResult.textContent = '';
}

function initScenarioTheater() {
  if (!state.selectedLesson) {
    el.scenarioPrompt.textContent = 'Choose a lesson to load a scenario challenge.';
    el.scenarioChoices.innerHTML = '';
    return;
  }
  const scenario = state.selectedLesson.scenario;
  el.scenarioPrompt.textContent = scenario.prompt;
  el.scenarioResult.textContent = '';
  el.scenarioChoices.innerHTML = '';

  shuffle(scenario.options).forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = option.text;
    btn.addEventListener('click', () => {
      if (option.correct) {
        el.scenarioResult.textContent = 'Excellent! You chose the best contextual response.';
        el.scenarioResult.style.color = '#388d64';
        addRewards({ xp: 15, coins: 5, streak: 1 });
      } else {
        el.scenarioResult.textContent = 'Not quite. Try a phrase that fits the real-life context better.';
        el.scenarioResult.style.color = '#be5b67';
        addRewards({ hearts: -1, streak: -1 });
      }
    });
    el.scenarioChoices.appendChild(btn);
  });
}

function switchPage(pageId) {
  el.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.page === pageId));
  el.pages.forEach((page) => page.classList.toggle('hidden', page.id !== pageId));
}

el.tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchPage(tab.dataset.page));
});

el.completeLessonBtn.addEventListener('click', () => {
  if (!state.selectedLesson) return;
  state.progress[state.selectedLesson.id] = true;
  addRewards({ xp: 40, coins: 20, streak: 2, hearts: 1 });
  saveAll();
  renderWorldMap();
  renderLessonHub();
  el.mascotSpeech.textContent = 'Quest complete! You are climbing toward TOPIK champion status 🏆';
});

el.revealFlashBtn.addEventListener('click', () => {
  if (!state.selectedLesson || state.flashRevealed) return;
  state.flashRevealed = true;
  addRewards({ xp: 4, coins: 1 });
  initFlashArena();
});

el.nextFlashBtn.addEventListener('click', () => {
  if (!state.selectedLesson) return;
  state.flashIndex += 1;
  state.flashRevealed = false;
  initFlashArena();
});

el.checkBlankBtn.addEventListener('click', () => {
  if (!state.selectedLesson) return;
  const expected = state.selectedLesson.fill.answer.trim();
  const answer = el.blankInput.value.trim();
  if (answer === expected) {
    el.blankResult.textContent = 'Perfect forge! Your sentence is correct.';
    el.blankResult.style.color = '#388d64';
    addRewards({ xp: 18, coins: 6, streak: 1 });
  } else {
    el.blankResult.textContent = `Try again. Correct answer: ${expected}`;
    el.blankResult.style.color = '#be5b67';
    addRewards({ hearts: -1, streak: -1 });
  }
});

function init() {
  state.curriculum = buildCurriculum();
  renderHud();
  renderWorldMap();
  renderLessonHub();
  initFlashArena();
  initMemoryTemple();
  initBlankForge();
  initScenarioTheater();
}

init();
