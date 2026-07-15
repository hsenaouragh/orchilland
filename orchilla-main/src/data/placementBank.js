// ─────────────────────────────────────────────────────────────────────────────
// CEFR placement bank + engine.
//
// Questions are grouped by language and CEFR level (A1…C2). On each attempt we
// randomly sample SHOWN_PER_LEVEL questions from each level's pool and shuffle
// the answer options, so successive students almost never see the same test.
//
// Scoring uses the "ceiling" method: the student is placed at the highest level
// they passed (>= PASS_RATIO correct) with every lower level also passed.
//
// Each question: { id, q, options: [strings], answer: <index of correct option> }
// To grow the bank toward the 30-per-level target, just add more objects to the
// matching level array — the engine picks up new questions automatically.
// ─────────────────────────────────────────────────────────────────────────────

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// How many questions from each level's pool appear in a single test, and the
// share of a level's questions a student must get right to "pass" that level.
export const SHOWN_PER_LEVEL = 5
export const PASS_RATIO = 0.6

export const LEVEL_COLORS = {
  A1: '#8B5CF6', A2: '#378ADD', B1: '#1D9E75', B2: '#0F9D58', C1: '#E85D26', C2: '#B23B2E',
}

// A compact helper to keep the bank terse: q(text, [opts], correctIndex)
const q = (id, text, options, answer) => ({ id, q: text, options, answer })

export const PLACEMENT_BANK = {
  english: {
    A1: [
      q('en-a1-1', 'She ___ a student.', ['is', 'are', 'am', 'be'], 0),
      q('en-a1-2', 'I ___ from Spain.', ['is', 'am', 'are', 'be'], 1),
      q('en-a1-3', 'They ___ my friends.', ['is', 'am', 'are', 'be'], 2),
      q('en-a1-4', 'This is ___ apple.', ['a', 'an', 'the', '—'], 1),
      q('en-a1-5', 'He ___ tea every morning.', ['drink', 'drinks', 'drinking', 'drank'], 1),
      q('en-a1-6', '___ you like coffee?', ['Do', 'Does', 'Are', 'Is'], 0),
      q('en-a1-7', 'There ___ two books on the table.', ['is', 'are', 'be', 'am'], 1),
      q('en-a1-8', 'My sister is ___ years old.', ['ten', 'tenth', 'the ten', 'a ten'], 0),
      q('en-a1-9', 'We go to school ___ Monday.', ['in', 'at', 'on', 'to'], 2),
      q('en-a1-10', 'What ___ your name?', ['is', 'are', 'am', 'do'], 0),
    ],
    A2: [
      q('en-a2-1', 'Yesterday I ___ to the cinema.', ['go', 'went', 'gone', 'going'], 1),
      q('en-a2-2', 'She is ___ than her brother.', ['tall', 'taller', 'tallest', 'more tall'], 1),
      q('en-a2-3', 'I have ___ finished my homework.', ['yet', 'already', 'still', 'ever'], 1),
      q('en-a2-4', 'They ___ watching TV now.', ['is', 'are', 'am', 'be'], 1),
      q('en-a2-5', 'If it rains, we ___ stay home.', ['will', 'would', 'are', 'did'], 0),
      q('en-a2-6', 'He can’t drive ___ he has no car.', ['because', 'so', 'but', 'although'], 0),
      q('en-a2-7', 'There isn’t ___ milk in the fridge.', ['some', 'any', 'many', 'a'], 1),
      q('en-a2-8', 'We ___ to the beach last summer.', ['go', 'were going', 'went', 'have gone'], 2),
    ],
    B1: [
      q('en-b1-1', 'By the time we arrived, the film ___.', ['started', 'had started', 'has started', 'starts'], 1),
      q('en-b1-2', 'I wish I ___ more time to travel.', ['have', 'had', 'will have', 'having'], 1),
      q('en-b1-3', 'The report ___ by Friday.', ['must finish', 'must be finished', 'must finishing', 'must to finish'], 1),
      q('en-b1-4', 'She asked me where I ___.', ['live', 'lived', 'am living', 'will live'], 1),
      q('en-b1-5', 'He’s used to ___ early.', ['get up', 'getting up', 'got up', 'gets up'], 1),
      q('en-b1-6', 'Neither of the answers ___ correct.', ['is', 'are', 'were', 'have'], 0),
      q('en-b1-7', 'I’d rather you ___ smoke here.', ['don’t', 'didn’t', 'won’t', 'not'], 1),
      q('en-b1-8', 'The more you practise, ___ you get.', ['good', 'better', 'the better', 'best'], 2),
    ],
    B2: [
      q('en-b2-1', 'Had I known, I ___ differently.', ['will act', 'would have acted', 'had acted', 'act'], 1),
      q('en-b2-2', 'The project, ___ took months, finally succeeded.', ['who', 'which', 'what', 'whose'], 1),
      q('en-b2-3', 'Not only ___ late, but he also forgot the keys.', ['he was', 'was he', 'he is', 'is he'], 1),
      q('en-b2-4', 'She denied ___ the document.', ['to take', 'taking', 'take', 'taken'], 1),
      q('en-b2-5', 'It’s high time we ___ a decision.', ['make', 'made', 'making', 'have made'], 1),
      q('en-b2-6', 'The results were ___ we had expected.', ['as', 'so', 'such', 'than'], 0),
      q('en-b2-7', 'He spoke ___ that everyone understood.', ['so clear', 'so clearly', 'such clearly', 'clear'], 1),
      q('en-b2-8', 'Little ___ that the meeting was cancelled.', ['he knew', 'did he know', 'he did know', 'knew he'], 1),
    ],
    C1: [
      q('en-c1-1', 'Choose the closest meaning: "meticulous".', ['careless', 'very careful', 'quick', 'rude'], 1),
      q('en-c1-2', 'The scandal ___ the minister’s resignation.', ['brought about', 'brought up', 'brought off', 'brought round'], 0),
      q('en-c1-3', '"To take something with a pinch of salt" means to ___.', ['believe fully', 'be sceptical', 'add flavour', 'get angry'], 1),
      q('en-c1-4', 'Were it not for your help, I ___ failed.', ['will have', 'would have', 'had', 'have'], 1),
      q('en-c1-5', 'His argument was ___, lacking any real evidence.', ['sound', 'tenuous', 'robust', 'lucid'], 1),
      q('en-c1-6', 'Choose the closest meaning: "to concede".', ['to admit', 'to refuse', 'to attack', 'to ignore'], 0),
      q('en-c1-7', 'The policy was implemented ___ widespread opposition.', ['despite of', 'in spite', 'notwithstanding', 'although'], 2),
    ],
    C2: [
      q('en-c2-1', 'Choose the closest meaning: "ineffable".', ['easily said', 'too great for words', 'unimportant', 'clearly written'], 1),
      q('en-c2-2', '"A pyrrhic victory" is one that ___.', ['costs too much to be worthwhile', 'is easily won', 'is shared', 'comes early'], 0),
      q('en-c2-3', 'Choose the closest meaning: "obfuscate".', ['clarify', 'confuse deliberately', 'summarise', 'praise'], 1),
      q('en-c2-4', 'He remained ___ despite the provocation.', ['irascible', 'equanimous', 'volatile', 'petulant'], 1),
      q('en-c2-5', 'Choose the closest meaning: "perfunctory".', ['thorough', 'done with little effort', 'enthusiastic', 'illegal'], 1),
      q('en-c2-6', '"To split hairs" means to ___.', ['argue over trivial details', 'end a friendship', 'cut costs', 'work hard'], 0),
    ],
  },

  french: {
    A1: [
      q('fr-a1-1', 'Je ___ français.', ['suis', 'es', 'est', 'sont'], 0),
      q('fr-a1-2', 'Tu ___ un chat.', ['ai', 'as', 'a', 'avons'], 1),
      q('fr-a1-3', 'C’est ___ pomme.', ['un', 'une', 'le', 'des'], 1),
      q('fr-a1-4', 'Nous ___ à Paris.', ['habite', 'habites', 'habitons', 'habitent'], 2),
      q('fr-a1-5', 'Elle ___ du café.', ['boit', 'bois', 'boivent', 'buvez'], 0),
      q('fr-a1-6', '___ tu aimes le sport ?', ['Est-ce que', 'Qu’est', 'Quoi', 'Où'], 0),
    ],
    A2: [
      q('fr-a2-1', 'Hier, j’___ mangé au restaurant.', ['ai', 'suis', 'as', 'a'], 0),
      q('fr-a2-2', 'Elle est plus grande ___ moi.', ['de', 'que', 'comme', 'des'], 1),
      q('fr-a2-3', 'Il faut que tu ___ prudent.', ['es', 'sois', 'est', 'être'], 1),
      q('fr-a2-4', 'Nous ___ au parc quand il a plu.', ['sommes', 'étions', 'avons', 'serons'], 1),
      q('fr-a2-5', 'Je ne mange ___ de viande.', ['jamais', 'toujours', 'déjà', 'encore'], 0),
      q('fr-a2-6', 'Demain, je ___ mes amis.', ['vois', 'verrai', 'voyais', 'ai vu'], 1),
    ],
    B1: [
      q('fr-b1-1', 'Si j’avais le temps, je ___.', ['voyage', 'voyagerais', 'voyagerai', 'voyageais'], 1),
      q('fr-b1-2', 'Le livre ___ je parle est excellent.', ['que', 'dont', 'qui', 'où'], 1),
      q('fr-b1-3', 'Il a fini avant que nous ___ arrivés.', ['sommes', 'soyons', 'soyions', 'serions'], 1),
      q('fr-b1-4', 'Elle m’a dit qu’elle ___ fatiguée.', ['est', 'était', 'sera', 'soit'], 1),
      q('fr-b1-5', 'Bien qu’il ___ riche, il est modéré.', ['est', 'soit', 'était', 'sera'], 1),
      q('fr-b1-6', 'Je viens de ___ mon travail.', ['finir', 'finissant', 'fini', 'finis'], 0),
    ],
    B2: [
      q('fr-b2-1', 'Il aurait réussi s’il ___ davantage.', ['travaillait', 'avait travaillé', 'travaille', 'travaillerait'], 1),
      q('fr-b2-2', 'Quoi qu’il ___, il reste calme.', ['arrive', 'arrivait', 'arrivera', 'arriver'], 0),
      q('fr-b2-3', 'C’est la meilleure décision que j’___ prise.', ['ai', 'aie', 'avais', 'aurai'], 1),
      q('fr-b2-4', 'Sens le plus proche : "éphémère".', ['durable', 'de courte durée', 'ancien', 'brillant'], 1),
      q('fr-b2-5', 'Il parle ___ que tout le monde comprend.', ['si clairement', 'aussi clair', 'tellement clair', 'plus clair'], 0),
      q('fr-b2-6', 'Ce ___ m’intéresse, c’est la culture.', ['que', 'qui', 'dont', 'où'], 1),
    ],
    C1: [
      q('fr-c1-1', 'Sens le plus proche : "s’évertuer".', ['abandonner', 'faire de gros efforts', 'se reposer', 'mentir'], 1),
      q('fr-c1-2', '"Tirer son épingle du jeu" signifie ___.', ['se sortir habilement d’une situation', 'perdre', 'coudre', 'jouer'], 0),
      q('fr-c1-3', 'Sens le plus proche : "un imbroglio".', ['une clarté', 'une situation confuse', 'un accord', 'un voyage'], 1),
      q('fr-c1-4', 'N’eût été votre aide, j’___ échoué.', ['aurais', 'aurai', 'avais', 'ai'], 0),
      q('fr-c1-5', 'Sens le plus proche : "concis".', ['long', 'bref et précis', 'vague', 'ennuyeux'], 1),
    ],
    C2: [
      q('fr-c2-1', 'Sens le plus proche : "atermoyer".', ['se décider vite', 'remettre à plus tard', 'refuser', 'accepter'], 1),
      q('fr-c2-2', 'Sens le plus proche : "obséquieux".', ['fier', 'trop poli par intérêt', 'honnête', 'timide'], 1),
      q('fr-c2-3', '"Battre en brèche" une idée, c’est ___.', ['la soutenir', 'l’attaquer', 'l’ignorer', 'la répéter'], 1),
      q('fr-c2-4', 'Sens le plus proche : "un panacée".', ['un remède universel', 'un poison', 'un problème', 'un doute'], 0),
    ],
  },

  italian: {
    A1: [
      q('it-a1-1', 'Io ___ italiano.', ['sono', 'sei', 'è', 'siamo'], 0),
      q('it-a1-2', 'Lei ___ una studentessa.', ['sono', 'sei', 'è', 'siete'], 2),
      q('it-a1-3', 'Questo è ___ libro.', ['un', 'una', 'uno', 'i'], 0),
      q('it-a1-4', 'Noi ___ a Roma.', ['abito', 'abiti', 'abitiamo', 'abitano'], 2),
      q('it-a1-5', 'Loro ___ il caffè.', ['bevo', 'beve', 'bevono', 'bevi'], 2),
      q('it-a1-6', '___ ti chiami?', ['Come', 'Dove', 'Chi', 'Cosa'], 0),
    ],
    A2: [
      q('it-a2-1', 'Ieri ___ una pizza.', ['mangio', 'ho mangiato', 'mangiavo', 'mangerò'], 1),
      q('it-a2-2', 'Lei è più alta ___ me.', ['di', 'che', 'come', 'da'], 0),
      q('it-a2-3', 'Quando ero piccolo, ___ spesso al parco.', ['vado', 'andavo', 'sono andato', 'andrò'], 1),
      q('it-a2-4', 'Non ho ___ tempo.', ['molto', 'molta', 'molti', 'molte'], 0),
      q('it-a2-5', 'Domani ___ i miei amici.', ['vedo', 'vedrò', 'vedevo', 'ho visto'], 1),
      q('it-a2-6', 'Devi ___ attento.', ['essere', 'sei', 'sono', 'stato'], 0),
    ],
    B1: [
      q('it-b1-1', 'Se avessi tempo, ___ di più.', ['viaggio', 'viaggerei', 'viaggerò', 'viaggiavo'], 1),
      q('it-b1-2', 'Il ragazzo ___ parlo è mio cugino.', ['che', 'di cui', 'cui', 'chi'], 1),
      q('it-b1-3', 'Penso che lui ___ ragione.', ['ha', 'abbia', 'avrà', 'aveva'], 1),
      q('it-b1-4', 'Mi ha detto che ___ stanco.', ['è', 'era', 'sarà', 'sia'], 1),
      q('it-b1-5', 'Benché ___ ricco, è modesto.', ['è', 'sia', 'era', 'sarà'], 1),
      q('it-b1-6', 'Ho appena ___ di lavorare.', ['finito', 'finire', 'finendo', 'finisco'], 0),
    ],
    B2: [
      q('it-b2-1', 'Avrebbe vinto se ___ di più.', ['si allenava', 'si fosse allenato', 'si allena', 'si allenerebbe'], 1),
      q('it-b2-2', 'Qualunque cosa ___, resta calmo.', ['succede', 'succeda', 'succederà', 'succedeva'], 1),
      q('it-b2-3', 'È la decisione migliore che io ___ preso.', ['ho', 'abbia', 'avevo', 'avrò'], 1),
      q('it-b2-4', 'Significato più vicino: "effimero".', ['duraturo', 'di breve durata', 'antico', 'luminoso'], 1),
      q('it-b2-5', 'Parla ___ che tutti capiscono.', ['così chiaramente', 'tanto chiaro', 'più chiaro', 'chiaro'], 0),
      q('it-b2-6', 'Ciò ___ mi interessa è la storia.', ['che', 'cui', 'chi', 'dove'], 0),
    ],
    C1: [
      q('it-c1-1', 'Significato più vicino: "meticoloso".', ['distratto', 'molto preciso', 'veloce', 'gentile'], 1),
      q('it-c1-2', '"Prendere fischi per fiaschi" significa ___.', ['fraintendere', 'vincere', 'cucinare', 'dormire'], 0),
      q('it-c1-3', 'Significato più vicino: "conciso".', ['lungo', 'breve e chiaro', 'vago', 'noioso'], 1),
      q('it-c1-4', 'Significato più vicino: "arduo".', ['facile', 'molto difficile', 'inutile', 'comune'], 1),
      q('it-c1-5', 'Fu attuato ___ le proteste.', ['malgrado', 'sebbene', 'benché', 'affinché'], 0),
    ],
    C2: [
      q('it-c2-1', 'Significato più vicino: "procrastinare".', ['agire subito', 'rimandare', 'rifiutare', 'accettare'], 1),
      q('it-c2-2', 'Significato più vicino: "ossequioso".', ['fiero', 'servile per interesse', 'onesto', 'timido'], 1),
      q('it-c2-3', 'Significato più vicino: "panacea".', ['rimedio universale', 'veleno', 'problema', 'dubbio'], 0),
      q('it-c2-4', 'Significato più vicino: "lapidario".', ['prolisso', 'breve e incisivo', 'confuso', 'gentile'], 1),
    ],
  },

  korean: {
    A1: [
      q('ko-a1-1', '저는 학생___.', ['이에요', '예요', '이에요?', '입니다'], 3),
      q('ko-a1-2', '이것___ 책이에요.', ['은', '는', '이', '가'], 0),
      q('ko-a1-3', '저는 물을 ___.', ['먹어요', '마셔요', '가요', '봐요'], 1),
      q('ko-a1-4', '학교___ 가요.', ['에', '에서', '을', '으로'], 0),
      q('ko-a1-5', '사과를 ___.', ['먹어요', '마셔요', '자요', '읽어요'], 0),
      q('ko-a1-6', '이름이 ___?', ['뭐예요', '어때요', '왜요', '누구예요'], 0),
    ],
    A2: [
      q('ko-a2-1', '어제 영화를 ___.', ['봐요', '봤어요', '볼 거예요', '보고 있어요'], 1),
      q('ko-a2-2', '형보다 키가 더 ___.', ['커요', '작아요', '높아요', '길어요'], 0),
      q('ko-a2-3', '밥을 먹고 ___ 자요.', ['서', '나서', '지만', '면'], 1),
      q('ko-a2-4', '내일 친구를 ___.', ['만나요', '만났어요', '만나요?', '만날 거예요'], 3),
      q('ko-a2-5', '비가 ___ 집에 있어요.', ['와서', '와도', '오면', '와서요'], 0),
      q('ko-a2-6', '이 음식은 ___.', ['맛있어요', '맛없어', '맛있어', '맛없어요?'], 0),
    ],
    B1: [
      q('ko-b1-1', '시간이 있으___ 여행을 가겠어요.', ['면', '지만', '니까', '서'], 0),
      q('ko-b1-2', '그가 온다고 ___.', ['들었어요', '봤어요', '했어요', '갔어요'], 0),
      q('ko-b1-3', '비싸___ 사겠어요.', ['지만', '면', '도', '서'], 0),
      q('ko-b1-4', '한국어를 배운 ___ 2년이에요.', ['지', '것', '거', '때'], 0),
      q('ko-b1-5', '더 열심히 할___ 생각이에요.', ['까', '가', '지', '거라는'], 3),
      q('ko-b1-6', '마치 꿈을 꾸는 ___ 같아요.', ['것', '거', '지', '때'], 0),
    ],
    B2: [
      q('ko-b2-1', '열심히 했___ 합격했을 거예요.', ['으면', '었더라면', '지만', '는데'], 1),
      q('ko-b2-2', '무슨 일이 ___ 침착해요.', ['생겨도', '생겨서', '생기면', '생겨야'], 0),
      q('ko-b2-3', '제가 낸 결정 중 최선___.', ['이에요', '이었어요', '이었던 거예요', '일 거예요'], 0),
      q('ko-b2-4', '가장 가까운 뜻: "찰나하다".', ['오래가다', '순간적이다', '크다', '조용하다'], 1),
      q('ko-b2-5', '모두가 이해할 만큼 ___ 말했어요.', ['분명하게', '분명한', '분명해서', '분명도'], 0),
      q('ko-b2-6', '제가 관심 있는 ___ 역사예요.', ['것은', '것이', '것도', '것을'], 0),
    ],
    C1: [
      q('ko-c1-1', '가장 가까운 뜻: "꼼꼼하다".', ['게으르다', '면밀하다', '빠르다', '친절하다'], 1),
      q('ko-c1-2', '"발이 넓다"는 뜻은?', ['아는 사람이 많다', '키가 크다', '빨리 걷는다', '게으르다'], 0),
      q('ko-c1-3', '가장 가까운 뜻: "간결하다".', ['길다', '짧고 명확하다', '복잡하다', '지루하다'], 1),
      q('ko-c1-4', '가장 가까운 뜻: "은은하다".', ['요란하다', '드러나지 않지만 깊다', '시끄럽다', '차갑다'], 1),
      q('ko-c1-5', '반대에___ 그 정책이 시행됐어요.', ['도 불구하고', '서', '면', '라서'], 0),
    ],
    C2: [
      q('ko-c2-1', '가장 가까운 뜻: "모호하다".', ['분명하다', '뚜렷하지 않다', '쉬운다', '밝다'], 1),
      q('ko-c2-2', '"소 잃고 외앵간 고친다"는 뜻은?', ['일이 터진 뒤 늦게 대비한다', '미리 준비한다', '빨리 끝낸다', '돈을 아낀다'], 0),
      q('ko-c2-3', '가장 가까운 뜻: "니허하다".', ['솔직하다', '사색이 깊고 능숙하다', '어린아같다', '약하다'], 1),
      q('ko-c2-4', '가장 가까운 뜻: "만연하다".', ['드물다', '널리 퍼지다', '작다', '사라지다'], 1),
    ],
  },
}

// Fisher–Yates shuffle (returns a new array).
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Shuffle a question's options and remap the correct-answer index.
const shuffleOptions = (question) => {
  const order = shuffle(question.options.map((_, i) => i))
  return {
    options: order.map(i => question.options[i]),
    answer: order.indexOf(question.answer),
  }
}

// Build one randomized attempt for a language: sample SHOWN_PER_LEVEL from each
// level, shuffle options, and tag each question with its level (as `section`).
export const buildPlacementTest = (languageKey = 'english') => {
  const bank = PLACEMENT_BANK[languageKey] || PLACEMENT_BANK.english
  const questions = []
  for (const level of LEVELS) {
    const pool = bank[level] || []
    const picked = shuffle(pool).slice(0, Math.min(SHOWN_PER_LEVEL, pool.length))
    for (const item of picked) {
      const shuffled = shuffleOptions(item)
      questions.push({
        id: item.id,
        question: item.q,
        options: shuffled.options,
        answer: shuffled.answer,
        section: level,
        type: 'mcq',
      })
    }
  }
  return questions
}

// Ceiling scoring → CEFR level. `answers` maps question id → chosen option index.
export const scorePlacement = (questions, answers) => {
  const byLevel = {}
  for (const question of questions) {
    const bucket = byLevel[question.section] || (byLevel[question.section] = { correct: 0, total: 0 })
    bucket.total += 1
    if (answers[question.id] === question.answer) bucket.correct += 1
  }

  const levelScores = LEVELS.map(level => {
    const bucket = byLevel[level] || { correct: 0, total: 0 }
    const ratio = bucket.total ? bucket.correct / bucket.total : 0
    return { level, correct: bucket.correct, total: bucket.total, ratio, passed: bucket.total > 0 && ratio >= PASS_RATIO }
  })

  // Highest level reached with every lower level also passed.
  let cefr = LEVELS[0]
  for (const ls of levelScores) {
    if (ls.passed) cefr = ls.level
    else break
  }

  const score = questions.filter(question => answers[question.id] === question.answer).length
  const total = questions.length
  const percentage = total ? Math.round((score / total) * 100) : 0
  return { score, total, percentage, cefr, levelScores }
}
