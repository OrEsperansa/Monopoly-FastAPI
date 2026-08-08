const fs = require('fs');
const path = require('path');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  TextRun,
} = require('docx');

const root = path.resolve(__dirname, '..');
// Design preset: compact_reference_guide. Named overrides: Arial for Hebrew
// legibility and the workshop_agenda title stack for classroom progress.
const artifactRoot = process.env.PROPERTY_EMPIRE_DOCX_ROOT
  ? path.resolve(process.env.PROPERTY_EMPIRE_DOCX_ROOT)
  : root;
const output = path.join(artifactRoot, 'docs', 'student-backend-exercises-he');

const boardTemplate = [
  { id: 0, name: 'נקודת יציאה', type: 'start' },
  { id: 1, name: 'ירדן', type: 'property', price: 100, rent: 20, owner_id: null },
  { id: 2, name: 'פסטיבל תרבות', type: 'reward', amount: 100 },
  { id: 3, name: 'קהיר', type: 'property', price: 120, rent: 24, owner_id: null },
  { id: 4, name: 'מכס', type: 'penalty', amount: 350 },
  { id: 5, name: 'איחוד האמירויות', type: 'property', price: 140, rent: 28, owner_id: null },
  { id: 6, name: 'הפתעה במדבר', type: 'surprise' },
  { id: 7, name: 'דובאי', type: 'property', price: 160, rent: 32, owner_id: null },
  { id: 8, name: 'עסקת נפט', type: 'reward', amount: 150 },
  { id: 9, name: 'מרוקו', type: 'property', price: 180, rent: 36, owner_id: null },
  { id: 10, name: 'מס נמל', type: 'penalty', amount: 450 },
  { id: 11, name: 'ביירות', type: 'property', price: 200, rent: 40, owner_id: null },
  { id: 12, name: 'תיירות משגשגת', type: 'reward', amount: 200 },
  { id: 13, name: 'דוחה', type: 'property', price: 220, rent: 44, owner_id: null },
  { id: 14, name: 'הפתעה בשוק', type: 'surprise' },
  { id: 15, name: 'מס יוקרה', type: 'penalty', amount: 650 },
];

function fullGameState({
  currentPlayerId = 1,
  availableActions = ['roll'],
  player1Money = 1500,
  player1Position = 0,
  player1Owned = [],
  player2Money = 1500,
  player2Position = 0,
  ownerByTile = {},
  lastEvent = 'Game created. Roll to begin.',
  eventLog = ['Game created. Roll to begin.'],
} = {}) {
  return {
    status: 'active',
    current_player_id: currentPlayerId,
    winner_id: null,
    available_actions: availableActions,
    players: [
      { id: 1, name: 'Ada', money: player1Money, position: player1Position, is_bankrupt: false, owned_tile_ids: player1Owned },
      { id: 2, name: 'Linus', money: player2Money, position: player2Position, is_bankrupt: false, owned_tile_ids: [] },
    ],
    board: boardTemplate.map((tile) => tile.type === 'property'
      ? { ...tile, owner_id: ownerByTile[tile.id] ?? null }
      : { ...tile }),
    last_event: lastEvent,
    event_log: eventLog,
  };
}

function jsonLines(value) {
  return JSON.stringify(value, null, 2).split('\n');
}

const exercises = [
  {
    file: '01_health_check.docx',
    title: 'תרגיל 1: שירות פעיל ו-Health Check',
    goal: 'ליצור שירות API שניתן להפעיל ולבדוק באמצעות בקשת HTTP ראשונה.',
    requirements: [
      'השירות צריך לקבל בקשות HTTP ולהחזיר תשובות JSON.',
      'יש ליצור נקודת קצה לבדיקת תקינות השירות.',
      'כל תשובה צריכה לכלול קוד HTTP מתאים וגוף JSON צפוי.',
    ],
    endpoints: [
      {
        method: 'GET', path: '/api/health',
        what: 'בדיקת זמינות השירות.',
        status: '200 OK',
        request: [],
        response: ['{', '  \u0022status\u0022: \u0022ok\u0022', '}'],
      },
    ],
    checks: [
      'בקשה לנתיב מחזירה 200.',
      'גוף התשובה זהה לדוגמה.',
      'סוג התוכן של התשובה הוא JSON.',
    ],
  },
  {
    file: '02_create_and_get_game.docx',
    title: 'תרגיל 2: יצירת משחק ושליפת מצב',
    goal: 'לאפשר פתיחת משחק חדש ושליפה חוזרת של מצב המשחק הנוכחי.',
    requirements: [
      'משחק חדש כולל 2 עד 4 שחקנים.',
      'כל שחקן מתחיל עם 1500 כסף, במיקום 0 וללא נכסים.',
      'השחקן הראשון הוא השחקן הנוכחי והפעולה הזמינה היא roll.',
      'הלוח כולל 16 משבצות ומתחיל במשבצת Start שמספרה 0.',
      'לאחר יצירת משחק, שליפת המצב צריכה להחזיר את אותו משחק.',
    ],
    endpoints: [
      {
        method: 'POST', path: '/api/game',
        what: 'יצירת משחק חדש.', status: '200 OK',
        request: ['{', '  \u0022player_names\u0022: [\u0022Ada\u0022, \u0022Linus\u0022]', '}'],
        response: [
          '{',
          '  \u0022status\u0022: \u0022active\u0022,',
          '  \u0022current_player_id\u0022: 1,',
          '  \u0022winner_id\u0022: null,',
          '  \u0022available_actions\u0022: [\u0022roll\u0022],',
          '  \u0022players\u0022: [',
          '    {\u0022id\u0022: 1, \u0022name\u0022: \u0022Ada\u0022, \u0022money\u0022: 1500, \u0022position\u0022: 0, \u0022is_bankrupt\u0022: false, \u0022owned_tile_ids\u0022: []}',
          '  ],',
          '  \u0022board\u0022: [/* 16 tiles */],',
          '  \u0022last_event\u0022: \u0022Game created. Roll to begin.\u0022,',
          '  \u0022event_log\u0022: [\u0022Game created. Roll to begin.\u0022]',
          '}',
        ],
      },
      {
        method: 'GET', path: '/api/game',
        what: 'החזרת מצב המשחק הנוכחי.', status: '200 OK', request: [],
        response: ['אותו מבנה GameState שהוחזר בעת יצירת המשחק.'],
      },
    ],
    checks: [
      'נוצרים שחקנים לפי סדר השמות עם מזהים שמתחילים ב-1.',
      'הלוח מכיל בדיוק 16 משבצות.',
      'בקשת GET לאחר יצירה מחזירה את המצב שנוצר.',
    ],
  },
  {
    file: '03_validation_and_response_contract.docx',
    title: 'תרגיל 3: ולידציה וחוזה JSON מלא',
    goal: 'להבטיח שכל קלט תקין וכל תשובת משחק תואמת לחוזה קבוע שהממשק יכול להציג.',
    requirements: [
      'יש לקבל בין 2 ל-4 שמות שחקנים בלבד.',
      'שם ריק או שם שמכיל רק רווחים אינו תקין.',
      'שמות כפולים אינם תקינים גם אם ההבדל הוא רק אות גדולה או קטנה באנגלית.',
      'יש להסיר רווחים מיותרים מתחילת שם ומסופו.',
      'קלט לא תקין מחזיר HTTP 422 ואינו יוצר משחק.',
      'כל תשובת GameState כוללת את כל שדות המשחק, השחקנים, הלוח והאירועים.',
    ],
    endpoints: [
      {
        method: 'POST', path: '/api/game',
        what: 'יצירת משחק עם ולידציה מלאה.', status: '200 או 422',
        request: ['{', '  \u0022player_names\u0022: [\u0022Ada\u0022, \u0022ada\u0022]', '}'],
        response: ['{', '  \u0022detail\u0022: [/* validation details */]', '}'],
      },
      {
        method: 'GET', path: '/api/game',
        what: 'החזרת GameState מלא.', status: '200 או 404', request: [],
        response: [
          '{',
          '  \u0022status\u0022: \u0022active | finished | not_started\u0022,',
          '  \u0022current_player_id\u0022: 1,',
          '  \u0022winner_id\u0022: null,',
          '  \u0022available_actions\u0022: [\u0022roll\u0022],',
          '  \u0022players\u0022: [/* players */],',
          '  \u0022board\u0022: [/* tiles */],',
          '  \u0022last_event\u0022: null,',
          '  \u0022event_log\u0022: []',
          '}',
        ],
      },
    ],
    checks: [
      'כל מקרי הקלט הלא תקין מחזירים 422.',
      'שמות תקינים נשמרים ללא רווחים חיצוניים.',
      'מבנה GameState נשאר זהה בכל נקודות הקצה שמחזירות מצב משחק.',
    ],
  },
  {
    file: '04_roll_movement_and_start_bonus.docx',
    title: 'תרגיל 4: זריקת קובייה ותנועה',
    goal: 'להוסיף פעולה שמגרילה קובייה, מזיזה את השחקן הנוכחי ומעדכנת את מצב המשחק.',
    requirements: [
      'תוצאת קובייה היא מספר שלם בין 1 ל-6.',
      'רק השחקן שתורו מתקדם לפי תוצאת הקובייה, ושאר השחקנים נשארים במקום.',
      'הלוח הוא מסלול מעגלי. כאשר שחקן מגיע לסוף הלוח, הוא ממשיך מתחילת הלוח לסיבוב נוסף.',
      'בכל פעם ששחקן משלים סיבוב ועובר דרך Start, הוא מקבל בדיוק 200 כסף.',
      'כל זריקה מוסיפה ל-event_log, רשימת האירועים שנמצאת בתוך GameState, מחרוזת אחת עם שם השחקן, תוצאת הקובייה והמיקום החדש, ומעתיקה את אותה מחרוזת בדיוק ל-last_event.',
      'במעבר דרך Start, אותה מחרוזת תנועה כוללת גם את הטקסט המדויק received 200 for Start; אין ליצור עבור הבונוס רשומת אירוע נפרדת.',
      'לאחר הזריקה available_actions מכילה end_turn בלבד. POST /api/game/end-turn מעביר את התור לשחקן הבא ומחזיר את roll כפעולה הזמינה היחידה.',
      'התשובה כוללת את מצב המשחק המלא בתוך השדה state.',
    ],
    endpoints: [
      {
        method: 'POST', path: '/api/game/roll',
        what: 'זריקת קובייה ותזוזת השחקן הנוכחי.', status: '200 OK', request: [],
        response: jsonLines({ state: fullGameState({
          availableActions: ['end_turn'],
          player1Position: 3,
          lastEvent: 'Ada rolled 3 and moved to 3.',
          eventLog: ['Game created. Roll to begin.', 'Ada rolled 3 and moved to 3.'],
        }) }),
      },
      {
        method: 'POST', path: '/api/game/end-turn',
        what: 'סיום התור ומעבר לשחקן הבא.', status: '200 OK', request: [],
        response: jsonLines({ state: fullGameState({
          currentPlayerId: 2,
          availableActions: ['roll'],
          player1Position: 3,
          lastEvent: "It is now Linus's turn.",
          eventLog: ['Game created. Roll to begin.', 'Ada rolled 3 and moved to 3.', "It is now Linus's turn."],
        }) }),
      },
    ],
    checks: [
      'השחקן ממשיך מתחילת הלוח לאחר השלמת סיבוב.',
      'השלמת סיבוב ומעבר דרך Start מעניקים 200.',
      'רק השחקן שתורו זז ושאר השחקנים נשארים במקום.',
      'לא ניתן לבצע roll כאשר הפעולה אינה זמינה.',
    ],
  },
  {
    file: '05_tile_types_and_buying.docx',
    title: 'תרגיל 5: סוגי משבצות וקניית נכס',
    goal: 'להוסיף סוגי משבצות שונים ולאפשר קנייה של נכס פנוי כאשר הפעולה מותרת.',
    requirements: [
      'הלוח כולל משבצות מהסוגים start, property, reward, penalty ו-surprise.',
      'נכס כולל price, rent ו-owner_id.',
      'כאשר נוחתים על נכס פנוי, הפעולות הזמינות הן buy ו-end_turn.',
      'קניית נכס מורידה את המחיר מכסף השחקן, מעדכנת בעלות ומוסיפה את מזהה הנכס לרשימת נכסי השחקן.',
      'לאחר קנייה הפעולה הזמינה היחידה היא end_turn.',
      'לא ניתן לקנות נכס תפוס, משבצת שאינה נכס או נכס שאין לשחקן מספיק כסף עבורו.',
    ],
    endpoints: [
      {
        method: 'POST', path: '/api/game/buy',
        what: 'קניית הנכס שעליו נמצא השחקן הנוכחי.', status: '200 או 409', request: [],
        response: [
          '{',
          '  \u0022state\u0022: {',
          '    \u0022available_actions\u0022: [\u0022end_turn\u0022],',
          '    \u0022players\u0022: [{\u0022id\u0022: 1, \u0022money\u0022: 1400, \u0022owned_tile_ids\u0022: [1]}],',
          '    \u0022board\u0022: [{\u0022id\u0022: 1, \u0022type\u0022: \u0022property\u0022, \u0022price\u0022: 100, \u0022rent\u0022: 20, \u0022owner_id\u0022: 1}]',
          '  }',
          '}',
        ],
      },
    ],
    checks: [
      'הכסף יורד בדיוק לפי price.',
      'owner_id תואם למזהה הקונה.',
      'אותו נכס מופיע ב-owned_tile_ids של הקונה.',
      'ניסיון קנייה לא חוקי מחזיר 409 ואינו משנה את המצב.',
    ],
  },
  {
    file: '06_rent_effects_and_events.docx',
    title: 'תרגיל 6: שכירות, פרסים, קנסות ואירועים',
    goal: 'להשלים את ההשפעה של כל משבצת ולהחזיר לממשק תיאור מלא של מה שקרה.',
    requirements: [
      'נחיתה על נכס של שחקן אחר מעבירה rent מהשוכר לבעלים.',
      'נחיתה על נכס עצמי אינה משנה כסף.',
      'משבצת reward מוסיפה את amount לכסף.',
      'משבצת penalty מורידה את amount מהכסף.',
      'משבצת surprise מפעילה תוצאה אקראית מוגדרת, כגון קבלת כסף, תשלום כסף או תנועה נוספת.',
      'כל פעולה משמעותית מעדכנת last_event ומוסיפה רשומה חדשה לסוף event_log.',
      'לאחר פתרון המשבצת הפעולות הזמינות חייבות להתאים למצב החדש.',
    ],
    endpoints: [
      {
        method: 'POST', path: '/api/game/roll',
        what: 'זריקה, תנועה והפעלת השפעת המשבצת.', status: '200 OK', request: [],
        response: [
          '{',
          '  \u0022state\u0022: {',
          '    \u0022available_actions\u0022: [\u0022end_turn\u0022],',
          '    \u0022last_event\u0022: \u0022Ada paid 20 rent to Linus for Bakery.\u0022,',
          '    \u0022event_log\u0022: [\u0022...\u0022, \u0022Ada paid 20 rent to Linus for Bakery.\u0022]',
          '  }',
          '}',
        ],
      },
    ],
    checks: [
      'בשכירות, הסכום שיורד מהשוכר זהה לסכום שמתווסף לבעלים.',
      'Reward ו-Penalty משנים כסף בסכום המשבצת המדויק.',
      'last_event תמיד זהה לרשומה האחרונה ב-event_log.',
      'כל תוצאת Surprise משאירה מצב משחק חוקי.',
    ],
  },
  {
    file: '07_turns_actions_and_errors.docx',
    title: 'תרגיל 7: ניהול תורות ושגיאות',
    goal: 'להבטיח שהמשחק מתקדם לפי תור ושכל פעולה מותרת רק בזמן המתאים.',
    requirements: [
      'סיום תור מעביר את השליטה לשחקן הפעיל הבא בצורה מעגלית.',
      'בתחילת כל תור הפעולה הזמינה היא roll בלבד.',
      'יש לדלג על שחקנים שפשטו רגל.',
      'פעולה שאינה מופיעה ב-available_actions מחזירה 409 ואינה משנה את מצב המשחק.',
      'בקשה למצב משחק כאשר אין משחק מחזירה 404.',
      'כל שגיאת משחק מוחזרת כ-JSON עם השדה detail.',
    ],
    endpoints: [
      {
        method: 'POST', path: '/api/game/end-turn',
        what: 'סיום התור הנוכחי ומעבר לשחקן הבא.', status: '200 או 409', request: [],
        response: [
          '{',
          '  \u0022state\u0022: {',
          '    \u0022current_player_id\u0022: 2,',
          '    \u0022available_actions\u0022: [\u0022roll\u0022],',
          '    \u0022last_event\u0022: \u0022It is now Linus turn.\u0022',
          '  }',
          '}',
        ],
      },
      {
        method: 'ANY', path: 'פעולה לא חוקית',
        what: 'תשובת שגיאה אחידה.', status: '409 Conflict', request: [],
        response: ['{', '  \u0022detail\u0022: \u0022Action is not available now.\u0022', '}'],
      },
    ],
    checks: [
      'לא ניתן לזרוק פעמיים באותו תור.',
      'לא ניתן לקנות כאשר buy אינו זמין.',
      'פעולה שנכשלה אינה משנה כסף, מיקום, בעלות או שחקן נוכחי.',
      'שחקן שפשט רגל אינו מקבל תור.',
    ],
  },
  {
    file: '08_complete_game.docx',
    title: 'תרגיל 8: המשחק המלא',
    goal: 'להשלים משחק מלא שהממשק יכול להפעיל אך ורק באמצעות נקודות הקצה.',
    requirements: [
      'כאשר כסף של שחקן יורד מתחת ל-0, is_bankrupt הופך ל-true.',
      'כאשר נשאר שחקן פעיל אחד, status הופך ל-finished ו-winner_id מקבל את מזהה המנצח.',
      'במשחק שהסתיים available_actions היא רשימה ריקה ולא ניתן לבצע פעולות משחק נוספות.',
      'איפוס מחזיר מצב not_started עם players ו-board ריקים.',
      'הממשק מציג את GameState שהשרת מחזיר ושולח בקשות לפי available_actions.',
      'השרת הוא מקור האמת היחיד לכסף, מיקום, בעלות, תור, פעולות זמינות, אירועים ומנצח.',
      'אין לשנות את חוזה ה-JSON כדי להתאים פתרון חלקי.',
    ],
    endpoints: [
      { method: 'GET', path: '/api/health', what: 'בדיקת תקינות.', status: '200', request: [], response: ['{\u0022status\u0022: \u0022ok\u0022}'] },
      { method: 'POST', path: '/api/game', what: 'יצירת משחק.', status: '200 או 422', request: ['{\u0022player_names\u0022: [\u0022Ada\u0022, \u0022Linus\u0022]}'], response: ['GameState'] },
      { method: 'GET', path: '/api/game', what: 'שליפת מצב.', status: '200 או 404', request: [], response: ['GameState'] },
      { method: 'POST', path: '/api/game/roll', what: 'זריקה ותנועה.', status: '200 או 409', request: [], response: ['{\u0022state\u0022: GameState}'] },
      { method: 'POST', path: '/api/game/buy', what: 'קניית נכס.', status: '200 או 409', request: [], response: ['{\u0022state\u0022: GameState}'] },
      { method: 'POST', path: '/api/game/end-turn', what: 'סיום תור.', status: '200 או 409', request: [], response: ['{\u0022state\u0022: GameState}'] },
      { method: 'POST', path: '/api/game/reset', what: 'איפוס המשחק.', status: '200', request: [], response: [
        '{',
        '  \u0022state\u0022: {',
        '    \u0022status\u0022: \u0022not_started\u0022,',
        '    \u0022current_player_id\u0022: null,',
        '    \u0022winner_id\u0022: null,',
        '    \u0022available_actions\u0022: [],',
        '    \u0022players\u0022: [],',
        '    \u0022board\u0022: []',
        '  }',
        '}',
      ] },
    ],
    checks: [
      'ניתן ליצור משחק, לשחק מספר תורות, לקנות נכס, לשלם שכירות ולאפס.',
      'שחקן עם כסף שלילי מסומן כפושט רגל ומפסיק לקבל תורות.',
      'כאשר נשאר שחקן אחד, התשובה מציגה finished, winner_id ורשימת פעולות ריקה.',
      'כל כפתור בממשק מייצג בקשת API בלבד.',
      'הממשק אינו מחשב תנועה, כסף, שכירות, בעלות, תורות או ניצחון.',
    ],
  },
];

const learningMetadata = [
  {
    duration: '30–45 דקות',
    prerequisites: ['היכרות בסיסית עם Python, HTTP ו-JSON.', 'יכולת להפעיל סביבת Python ולהתקין את התלויות שסופקו.'],
    concepts: ['הפעלת שירות Web.', 'חוזה בסיסי של בקשה, קוד מצב ותשובת JSON.'],
    errors: ['נתיב או שיטת HTTP שגויים אינם נחשבים למימוש תקין.', 'התשובה חייבת להיות JSON תקין גם כאשר הלקוח אינו דפדפן.'],
    submission: ['קישור לקוד בנקודת הזמן של סיום התרגיל.', 'פלט של checkpoint 1 וצילום או העתק של בקשת health מוצלחת.'],
  },
  {
    duration: '60–90 דקות',
    prerequisites: ['השלמת תרגיל 1.', 'הבנת רשימות, אובייקטים ומזהים.'],
    concepts: ['יצירת משאב ושליפת מצב.', 'שמירת מצב עקבי בין בקשות.'],
    errors: ['יצירת משחק חדש מחליפה את המשחק הפעיל הקודם.', 'אין להחזיר מצב חלקי או לוח בגודל שונה.'],
    submission: ['פלט של checkpoint 2.', 'דוגמת POST ולאחריה GET שמציגים אותו מצב.'],
  },
  {
    duration: '45–60 דקות',
    prerequisites: ['השלמת תרגיל 2.', 'היכרות עם ולידציה של קלט.'],
    concepts: ['חוזה JSON מלא.', 'ולידציה ושמירת מצב לאחר בקשה שנכשלה.'],
    errors: ['פחות מ-2 או יותר מ-4 שמות, שם ריק ושם כפול מחזירים 422.', 'בקשה לא תקינה אינה מחליפה את המשחק הפעיל.'],
    submission: ['פלט של checkpoint 3.', 'דוגמה אחת לקלט תקין ושתי דוגמאות לקלט שנדחה.'],
  },
  {
    duration: '60–90 דקות',
    prerequisites: ['השלמת תרגיל 3.', 'הבנת חשבון מודולרי בלוח מעגלי.'],
    concepts: ['מעבר מצב דטרמיניסטי.', 'תנועה, מעבר Start והגבלת פעולות.'],
    errors: ['תוצאת קובייה חייבת להיות מספר שלם בטווח 1–6.', 'roll שאינו זמין מחזיר 409 ללא שינוי מצב.'],
    submission: ['פלט של checkpoint 4 מתוך ה-UI.', 'דוגמת תנועה אמיתית שמציגה את ערך הקובייה ואת המיקום החדש.'],
  },
  {
    duration: '75–105 דקות',
    prerequisites: ['השלמת תרגיל 5.', 'הבנת בעלות ופעולה מותנית.'],
    concepts: ['סוגי משבצות.', 'עדכון אטומי של כסף ובעלות.'],
    errors: ['buy שאינו זמין מחזיר 409 ללא שינוי מצב.', 'אי אפשר לקנות משבצת שאינה נכס, נכס תפוס או נכס יקר מדי.'],
    submission: ['פלט של checkpoint 6.', 'דוגמאות לתגמול, קנס והפתעה.'],
  },
  {
    duration: '75–120 דקות',
    prerequisites: ['השלמת תרגיל 6.', 'הבנת השפעות כספיות ורישום אירועים.'],
    concepts: ['שכירות והעברת כסף.', 'Reward, Penalty, Surprise ועקביות יומן האירועים.'],
    errors: ['השפעה אינה יכולה להשאיר מיקום מחוץ ללוח.', 'last_event חייב להיות הרשומה האחרונה ב-event_log.'],
    submission: ['פלט של checkpoint 7.', 'מצב לפני ואחרי קנייה שמראה כסף, owner_id ו-owned_tile_ids.'],
  },
  {
    duration: '60–90 דקות',
    prerequisites: ['השלמת תרגיל 7.', 'הבנת מכונת מצבים פשוטה.'],
    concepts: ['סבב תורות ופעולות זמינות.', 'שגיאות דומיין ללא שינוי מצב.'],
    errors: ['פעולה שאינה ב-available_actions מחזירה 409.', 'GET ללא משחק מחזיר 404; שחקן שפשט רגל אינו מקבל תור.'],
    submission: ['פלט של checkpoint 8.', 'רצף בקשות שמראה תשלום שכירות.'],
  },
  {
    duration: '75–120 דקות',
    prerequisites: ['השלמת תרגילים 1–8.', 'יכולת לחבר את כל כללי המשחק לחוזה אחד יציב.'],
    concepts: ['פשיטת רגל, ניצחון ואיפוס.', 'שרת כמקור האמת היחיד עבור הממשק.'],
    errors: ['לאחר סיום המשחק אין פעולות זמינות.', 'reset מחזיר מצב not_started מלא ועקבי.'],
    submission: ['פלט של checkpoint 9.', 'הדגמה מלאה דרך הממשק וצילום מסך.', 'השתקפות קצרה: החלטה אחת, תקלה אחת ומה למדתם.'],
  },
];

const completionItems = [
  'כל נקודות הקצה שנדרשות עד לתרגיל זה מחזירות את קודי המצב וה-JSON שהוגדרו.',
  'כל בדיקות ה-checkpoint הנוכחי והתרגילים הקודמים עוברות.',
  'בדקתי לפחות מקרה הצלחה אחד ומקרה שגיאה אחד בלי לשנות את חוזה ה-API.',
  'שמרתי את ראיות ההגשה הנדרשות ואני מסוגל להסביר את החלטות המימוש שלי.',
];

const instructorHints = [
  ['בדקו קודם שהשירות אכן מאזין לכתובת ולפורט שנבחרו.', 'השוו בנפרד קוד מצב, Content-Type וגוף JSON.', 'התגובה הנדרשת היא בדיוק אובייקט status עם הערך ok.'],
  ['בקשו מהתלמידים לנסח מה חייב להישמר בין POST ל-GET.', 'בדקו מזהים, ערכי פתיחה וגודל לוח בנפרד.', 'יצירה תקינה מחזירה משחק active עם השחקן הראשון ופעולת roll.'],
  ['הפרידו בין בדיקת הקלט לבין יצירת מצב חדש.', 'בדקו רווחים חיצוניים וכפילויות ללא תלות בגודל אות.', 'כל קלט פסול מחזיר 422 והמשחק הקודם נשאר ללא שינוי.'],
  ['בדקו שתוצאת קובייה אמיתית נמצאת בטווח 1–6.', 'הזכירו שמיקום חדש מחושב על לוח בן 16 משבצות.', 'בדקו לאורך מספר תורות שמעבר בנקודת היציאה מדווח ומעניק את הבונוס.'],
  ['בקשו לזהות אילו שלושה ערכים חייבים להשתנות יחד בקנייה.', 'השוו מחיר הנכס להפרש בכסף ובדקו את שתי תצוגות הבעלות.', 'קנייה מעדכנת money, owner_id ו-owned_tile_ids באותה בקשה.'],
  ['בדקו כל סוג משבצת בנפרד לפני רצף משחק מלא.', 'בשכירות השוו את הירידה אצל השוכר לעלייה אצל הבעלים.', 'לאחר כל השפעה last_event חייב להיות האיבר האחרון ב-event_log.'],
  ['השתמשו ב-available_actions כרשימת ההרשאות של המצב הנוכחי.', 'שמרו צילום מצב לפני פעולה אסורה והשוו אחריה.', 'פעולה אסורה מחזירה 409 ואינה משנה כסף, מיקום, בעלות או תור.'],
  ['הריצו תרחיש ארוך דרך HTTP בלבד.', 'בדקו בנפרד פשיטת רגל, דילוג, מנצח ואיפוס.', 'כאשר נשאר שחקן פעיל אחד המשחק finished, אין פעולות, ו-reset מחזיר not_started.'],
];

// Curriculum v2: every exercise introduces one named capability. Existing
// endpoints may be extended in a later exercise, but are not presented as new.
Object.assign(exercises[1], {
  file: '02_create_game.docx',
  title: 'תרגיל 2: יצירת משחק חדש',
  goal: 'לקבל רשימת שמות, ליצור מצב משחק התחלתי מלא, לשמור אותו בזיכרון ולהחזיר אותו בתשובת היצירה.',
  requirements: [
    'גוף הבקשה הוא אובייקט JSON עם המפתח player_names. הערך שלו הוא רשימה מסודרת של 2 עד 4 מחרוזות; סדר השמות קובע את מזהי השחקנים ואת סדר התורות.',
    'כל שם עובר הסרת רווחים בתחילתו ובסופו. שם ריק ושמות כפולים ללא תלות באותיות גדולות או קטנות אינם תקינים.',
    'בקשה לא תקינה מחזירה 422 עם המפתח detail ואינה מחליפה משחק תקין שכבר נשמר.',
    'בקשה תקינה יוצרת משחק חדש, שומרת אותו כמשחק הפעיל בשרת ומחזירה את אותו GameState בגוף התשובה.',
    'status מציין באיזה שלב נמצא המשחק ומתחיל כ-active; current_player_id מזהה את השחקן שתורו לפעול ומתחיל ב-1; winner_id מזהה את המנצח ונשאר null כל עוד אין מנצח.',
    'available_actions היא רשימת הפעולות שהממשק רשאי לבקש עכשיו ומתחילה ב-roll בלבד.',
    'players היא רשימת מצבי השחקנים. id הוא מזהה ייחודי; name הוא שם התצוגה; money הוא יתרת הכסף ומתחיל ב-1500; position הוא מיקום השחקן ומתחיל ב-0; is_bankrupt קובע אם השחקן עדיין משתתף ומתחיל ב-false; owned_tile_ids מחזיק את מזהי הנכסים שבבעלותו ומתחיל כרשימה ריקה.',
    'board מתאר את מצב הלוח כרשימה מסודרת של בדיוק 16 משבצות. מזהה המשבצת הוא גם מיקומה במסלול, והמצב שלה כולל את הסוג והבעלות כאשר היא רלוונטית.',
    'בכל משבצת id מציין את המיקום, name הוא שם התצוגה ו-type קובע את ההתנהגות. בנכס price הוא מחיר הקנייה, rent הוא התשלום לבעלים ו-owner_id מזהה את הבעלים ומתחיל כ-null; בפרס או קנס amount הוא סכום ההשפעה.',
    'last_event מאפשר לממשק להציג את האירוע האחרון במהירות, ו-event_log שומר את היסטוריית האירועים לפי סדר. ביצירה שניהם מתחילים באירוע יצירת המשחק.',
  ],
  endpoints: [{
    method: 'POST', path: '/api/game', what: 'יצירת המשחק הפעיל, שמירתו והחזרת המצב ההתחלתי.', status: '200 OK או 422',
    request: ['{', '  "player_names": ["Ada", "Linus"]', '}'],
    response: jsonLines(fullGameState()),
  }],
  checks: [
    'קלט תקין מחזיר GameState מלא ושומר אותו כמצב הפעיל.',
    'מזהי השחקנים מתחילים ב-1 ותואמים לסדר player_names.',
    'board מכילה 16 משבצות עם מזהים 0–15 ללא חורים או כפילויות.',
    'קלט לא תקין מחזיר 422; שמות תקינים נשמרים ללא רווחים חיצוניים.',
  ],
});

Object.assign(exercises[2], {
  file: '03_retrieve_game_state.docx',
  title: 'תרגיל 3: שמירת מצב ושליפתו',
  goal: 'להוכיח שמצב המשחק נשמר בין בקשות ולהחזיר את המשחק הפעיל בלי ליצור משחק חדש.',
  requirements: [
    'תרגיל זה אינו מוסיף יצירה נוספת. השתמשו ב-POST /api/game מתרגיל 2 רק כדי להכין מצב לבדיקה.',
    'GET /api/game מחזיר את ה-GameState האחרון שנשמר בשרת, בדיוק באותו מבנה JSON שהוחזר בעת היצירה.',
    'קריאת GET היא לקריאה בלבד: היא אינה משנה תור, כסף, מיקום, בעלות, פעולות זמינות או יומן אירועים.',
    'מספר קריאות GET רצופות מחזירות אותו מצב כל עוד לא בוצעה פעולת משחק אחרת.',
    'כאשר עדיין לא נוצר משחק, הבקשה מחזירה 404 עם הודעה מתאימה שמסבירה את השגיאה.',
    'אם בקשת יצירה חדשה נכשלת בוולידציה, המשחק התקין הקודם נשאר שמור וזמין לשליפה.',
  ],
  endpoints: [{
    method: 'GET', path: '/api/game', what: 'שליפת המשחק הפעיל שכבר נשמר בשרת.', status: '200 OK או 404', request: [],
    response: jsonLines(fullGameState()),
  }],
  checks: [
    'לאחר יצירה, GET מחזיר מצב זהה לתשובת ה-POST.',
    'שתי קריאות GET רצופות מחזירות אותו JSON.',
    'יצירה שנדחתה ב-422 אינה מוחקת או מחליפה את המשחק השמור.',
    'GET לפני יצירת משחק מחזיר 404 עם הודעה מתאימה שמסבירה את השגיאה.',
  ],
});

Object.assign(exercises[4], {
  file: '06_tile_effects.docx',
  title: 'תרגיל 6: השפעות משבצות',
  goal: 'להרחיב את פעולת ה-roll שכבר קיימת כך שהשרת יפתור את השפעת המשבצת שעליה נחת השחקן.',
  requirements: [
    'אין נקודת קצה חדשה בתרגיל זה. POST /api/game/roll מתרגיל 4 ממשיכה לבצע תנועה וכעת גם מפעילה את סוג המשבצת.',
    'נחיתה על reward מוסיפה את amount לכסף; נחיתה על penalty מורידה את amount.',
    'נחיתה על surprise בוחרת באקראי תוצאה אחת: קבלת 100, תשלום 50, גביית 50 מכל שחקן פעיל אחר, תשלום 25 לכל שחקן פעיל אחר, תנועה קדימה בשתי משבצות או תנועה אחורה בשתי משבצות.',
    'לאחר כל תוצאת Surprise נשארת רק end_turn, ונוסף אירוע שמתאר את התוצאה ומכיל את המילה המדויקת Surprise.',
    'נחיתה על נכס פנוי אינה קונה אותו ואינה משנה כסף או בעלות: היא רק מוסיפה buy לצד end_turn ברשימת available_actions. הרכישה מתבצעת רק בבקשת POST /api/game/buy הנפרדת, שתמומש בתרגיל 7.',
    'כל השפעה מעדכנת last_event ומוסיפה אותו בסוף event_log. לאחר פתרון משבצת שאינה נכס פנוי נשארת רק end_turn.',
  ],
  endpoints: [{
    method: 'POST', path: '/api/game/roll', what: 'הרחבת הפעולה מתרגיל 4: לאחר התנועה, פתרון השפעת המשבצת.', status: '200 OK או 409', request: [],
    response: jsonLines({ state: fullGameState({
      availableActions: ['end_turn'],
      player1Money: 1600,
      player1Position: 2,
      lastEvent: 'Ada received 100 from פסטיבל תרבות.',
      eventLog: ['Game created. Roll to begin.', 'Ada rolled 2 and moved to 2.', 'Ada received 100 from פסטיבל תרבות.'],
    }) }),
  }],
  checks: [
    'Reward ו-Penalty משנים כסף בדיוק לפי amount.',
    'Surprise משאירה שחקן במיקום חוקי ומוסיפה אירוע.',
    'נכס פנוי מציע buy אך אינו משנה בעלות או כסף אוטומטית.',
    'last_event זהה תמיד לאיבר האחרון ב-event_log.',
  ],
});

Object.assign(exercises[5], {
  file: '07_buy_property.docx',
  title: 'תרגיל 7: קניית נכס',
  goal: 'להוסיף פעולה חדשה שקונה נכס פנוי רק כאשר השרת פרסם שהפעולה זמינה.',
  requirements: [
    'POST /api/game/buy מותרת רק כאשר buy מופיעה ב-available_actions של המצב הנוכחי.',
    'קנייה מפחיתה price מכסף השחקן, מציבה את מזהה השחקן ב-owner_id ומוסיפה את מזהה המשבצת ל-owned_tile_ids.',
    'שלושת העדכונים מתרחשים יחד באותה פעולה; אין להחזיר מצב שבו רק חלק מהם השתנה.',
    'לאחר קנייה available_actions מכילה end_turn בלבד ונוסף אירוע המתאר את הקנייה.',
    'ניסיון לקנות בזמן לא מתאים, נכס תפוס, משבצת שאינה property או נכס יקר מדי מחזיר 409 עם detail ואינו משנה מצב.',
  ],
  endpoints: [{
    method: 'POST', path: '/api/game/buy', what: 'קניית הנכס שעליו עומד השחקן הנוכחי.', status: '200 OK או 409 Conflict', request: [],
    response: jsonLines({ state: fullGameState({
      availableActions: ['end_turn'],
      player1Money: 1400,
      player1Position: 1,
      player1Owned: [1],
      ownerByTile: { 1: 1 },
      lastEvent: 'Ada bought ירדן for 100.',
      eventLog: ['Game created. Roll to begin.', 'Ada rolled 1 and moved to 1.', 'Ada landed on unowned ירדן.', 'Ada bought ירדן for 100.'],
    }) }),
  }],
  checks: [
    'הכסף יורד בדיוק לפי price.',
    'owner_id ו-owned_tile_ids מציגים אותה בעלות.',
    'לאחר הצלחה נשארת רק end_turn.',
    'קנייה אסורה מחזירה 409 ואינה משנה את המצב השמור.',
  ],
});

Object.assign(exercises[6], {
  file: '08_rent_and_advanced_turns.docx',
  title: 'תרגיל 8: שכירות וכללי תור מתקדמים',
  goal: 'להעביר את התור בצורה עקבית ולחייב שכירות כאשר שחקן נוחת על נכס של שחקן אחר.',
  requirements: [
    'POST /api/game/end-turn היא הפעולה החדשה: היא מעבירה את current_player_id לשחקן הפעיל הבא באופן מעגלי ומחזירה available_actions עם roll בלבד.',
    'לא ניתן לסיים תור לפני שהשחקן ביצע roll; פעולה שאינה זמינה מחזירה 409 ואינה משנה מצב.',
    'כאשר שחקן נוחת באמצעות roll הקיים על נכס בבעלות שחקן אחר, rent יורד מהשוכר ומתווסף לבעלים באותה פעולה.',
    'נחיתה על נכס עצמי אינה משנה כסף. יש לדלג בתור על שחקן שמסומן is_bankrupt.',
    'כל מעבר תור ותשלום שכירות מעדכנים last_event ואת סוף event_log.',
  ],
  endpoints: [{
    method: 'POST', path: '/api/game/end-turn', what: 'סיום התור לאחר הפעולה ומעבר לשחקן הפעיל הבא.', status: '200 OK או 409 Conflict', request: [],
    response: jsonLines({ state: fullGameState({
      currentPlayerId: 2,
      player1Money: 1600,
      player1Position: 2,
      lastEvent: "It is now Linus's turn.",
      eventLog: ['Game created. Roll to begin.', 'Ada rolled 2 and moved to 2.', 'Ada received 100 from פסטיבל תרבות.', "It is now Linus's turn."],
    }) }),
  }],
  checks: [
    'סיום תור מעביר לשחקן הבא ומחזיר roll כפעולה היחידה.',
    'אחרי השחקן האחרון התור חוזר לראשון.',
    'שכירות יורדת ועולה באותו סכום אצל שני השחקנים.',
    'פעולה אסורה מחזירה 409 ואינה משנה כסף, מיקום, בעלות או תור.',
  ],
});

Object.assign(exercises[7], {
  file: '09_complete_game.docx',
  title: 'תרגיל 9: מחזור חיים ומשחק מלא',
  goal: 'להשלים פשיטת רגל, ניצחון ואיפוס ולוודא שכל היכולות מהתרגילים הקודמים פועלות יחד דרך HTTP בלבד.',
  requirements: [
    'כאשר כסף של שחקן יורד מתחת ל-0 הוא מסומן is_bankrupt ואינו מקבל תורות נוספים.',
    'כאשר נשאר שחקן פעיל אחד status הופך ל-finished, winner_id הוא מזהה המנצח ו-available_actions הופכת לרשימה ריקה.',
    'לאחר סיום המשחק כל פעולת משחק שאינה reset מחזירה 409 ואינה משנה את מצב הסיום.',
    'POST /api/game/reset היא נקודת הקצה החדשה בתרגיל זה. היא מחזירה state במצב not_started עם players, board ו-available_actions ריקים.',
    'כל נקודות הקצה מהתרגילים 1–8 ממשיכות לעמוד באותו חוזה. הממשק רק מציג GameState ושולח פעולות שמופיעות ב-available_actions.',
    'השרת נשאר מקור האמת היחיד לכסף, מיקום, בעלות, תור, אירועים, פשיטת רגל ומנצח.',
  ],
  endpoints: [{
    method: 'POST', path: '/api/game/reset', what: 'מחיקת המשחק הפעיל והחזרת מצב ריק ועקבי.', status: '200 OK', request: [],
    response: jsonLines({ state: {
      status: 'not_started',
      current_player_id: null,
      winner_id: null,
      available_actions: [],
      players: [],
      board: [],
      last_event: 'Game reset.',
      event_log: ['Game reset.'],
    } }),
  }],
  checks: [
    'תרחיש HTTP מלא מגיע לקנייה, שכירות, פשיטת רגל ומנצח.',
    'במצב finished יש winner_id ואין פעולות זמינות.',
    'reset מחזיר חוזה not_started מלא וריק.',
    'כל תשעת ה-checkpoints עוברים במצב cumulative מתוך ה-UI.',
  ],
});

Object.assign(learningMetadata[1], {
  concepts: ['יצירת משאב וולידציה של קלט.', 'חוזה GameState ושמירת המצב הפעיל.'],
  errors: ['פחות מ-2 או יותר מ-4 שמות, שם ריק ושם כפול מחזירים 422.', 'board חייבת לכלול 16 אובייקטים עם מזהים 0–15.'],
  submission: ['פלט בדיקות תרגיל 2 מתוך ה-UI.', 'דוגמת POST תקינה ודוגמת 422 אחת.'],
});
Object.assign(learningMetadata[2], {
  concepts: ['שמירת מצב בין בקשות.', 'פעולת קריאה שאינה משנה מצב.'],
  errors: ['GET ללא משחק מחזיר 404.', 'בקשת יצירה שנכשלה אינה מחליפה מצב קיים.'],
  submission: ['פלט בדיקות תרגיל 3 מתוך ה-UI.', 'POST אחד ושתי קריאות GET שמחזירות אותו מצב.'],
});
Object.assign(learningMetadata[4], {
  concepts: ['פתרון Reward, Penalty ו-Surprise.', 'עדכון עקבי של כסף ויומן אירועים.'],
  errors: ['השפעה אינה משאירה מיקום מחוץ ללוח.', 'נכס פנוי אינו נקנה אוטומטית.'],
  submission: ['פלט בדיקות תרגיל 5 מתוך ה-UI.', 'דוגמאות לתגמול, קנס והפתעה.'],
});
Object.assign(learningMetadata[5], {
  concepts: ['פעולה מותנית.', 'עדכון אטומי של כסף ושתי תצוגות בעלות.'],
  errors: ['buy שאינה זמינה מחזירה 409.', 'כישלון קנייה אינו משנה מצב.'],
  submission: ['פלט בדיקות תרגיל 6 מתוך ה-UI.', 'מצב לפני ואחרי קנייה.'],
});
Object.assign(learningMetadata[6], {
  concepts: ['סבב תורות.', 'העברת שכירות ואכיפת available_actions.'],
  errors: ['end-turn לפני roll מחזיר 409.', 'שחקן שפשט רגל אינו מקבל תור.'],
  submission: ['פלט בדיקות תרגיל 7 מתוך ה-UI.', 'רצף שמציג מעבר תור ותשלום שכירות.'],
});

Object.assign(instructorHints[1], ['עברו עם התלמידים על כל מפתח בבקשה ובתשובה.', 'הדגישו ש-16 משבצות הן רשימה במיקומים 0–15 ולא הוראת עיצוב.', 'POST תקין שומר ומחזיר אותו GameState; ולידציה נכשלת ב-422.']);
Object.assign(instructorHints[2], ['השתמשו ב-POST רק כהכנה ושלחו לאחריו GET.', 'השוו את כל גוף ה-JSON ולא רק את מזהה המשחק.', 'GET חוזר ללא שינוי; כישלון יצירה אינו מחליף את המצב הקיים.']);
Object.assign(instructorHints[4], ['הזכירו שה-roll כבר נבנה בתרגיל 4 וכעת מרחיבים את תוצאת הנחיתה.', 'בדקו כל סוג משבצת בנפרד.', 'last_event חייב להיות האיבר האחרון ב-event_log.']);
Object.assign(instructorHints[5], ['בדקו אילו שלושה ערכים משתנים יחד בקנייה.', 'השוו price להפרש בכסף ואת שתי תצוגות הבעלות.', 'buy אסורה מחזירה 409 ללא שינוי מצב.']);
Object.assign(instructorHints[6], ['בדקו מעבר תור לפני שילוב שכירות.', 'בשכירות השוו את הירידה אצל השוכר לעלייה אצל הבעלים.', 'available_actions היא רשימת ההרשאות של המצב.']);

const exerciseNarratives = [
  {
    context: 'לפני שממשק המשחק יכול להציג שחקנים או לוח, הוא צריך לדעת שהשירות זמין ומוכן לקבל בקשות. המשימה הראשונה יוצרת בדיקת זמינות קטנה וחד-משמעית שאדם, דפדפן או מערכת בדיקות יכולים להבין באותה צורה.',
    journey: [
      'לקוח שולח בקשת GET לכתובת בדיקת התקינות.',
      'השירות מאשר שהבקשה הצליחה באמצעות קוד 200.',
      'הלקוח מקבל JSON קצר שמצהיר כי מצב השירות הוא ok.',
    ],
    terms: [
      'Endpoint — כתובת ושיטת HTTP שמייצגות פעולה אחת שהשירות מציע.',
      'HTTP status — מספר שמסביר אם הבקשה הצליחה או נכשלה; 200 פירושו הצלחה.',
      'JSON — מבנה טקסט מוסכם להעברת נתונים בין הממשק לשרת.',
    ],
    boundary: 'בשלב זה אין משחק, שחקנים או לוח. נדרשת רק הוכחה שהשירות פעיל ומחזיר את החוזה המדויק.',
  },
  {
    context: 'המשתמש מזין שמות ולוחץ על Start Game. מבחינתו, פעולה אחת צריכה לפתוח משחק מוכן: השחקנים קיימים, לכולם ערכי פתיחה, הלוח מסודר, התור הראשון ידוע והמצב נשמר כדי שהבקשות הבאות ימשיכו מאותה נקודה.',
    journey: [
      'הממשק שולח רשימת שמות מסודרת תחת player_names.',
      'השירות בודק שהרשימה מייצגת 2–4 שחקנים בעלי שמות תקינים וייחודיים.',
      'אם הקלט תקין, נוצר משחק active חדש והוא נשמר כמשחק הפעיל.',
      'אותו מצב מלא מוחזר לממשק, כולל שחקנים, 16 מיקומי לוח, הפעולה הבאה ויומן האירועים.',
      'אם הקלט אינו תקין, מוחזרת שגיאת 422 והמצב התקין האחרון אינו נפגע.',
    ],
    terms: [
      'GameState — תמונת המצב המלאה שהממשק צריך כדי להציג את המשחק ברגע נתון.',
      'player_names — רשימת מחרוזות; כל ערך הוא שם שחקן וסדר הערכים קובע את סדר המזהים.',
      'board — מסלול מסודר של משבצות. 16 משבצות פירושן 16 אובייקטים במיקומים 0–15, לא לוח חזותי בגודל 16 על 16.',
      'id — מזהה יציב שמאפשר לקשר בין שחקן, משבצת ובעלות.',
      'null — ערך שמציין שאין כרגע שחקן או בעלים מתאים, למשל winner_id לפני שיש מנצח.',
    ],
    boundary: 'נדרש להגדיר מה השרת מקבל, שומר ומחזיר. אין דרישה למבנה תיקיות, למחלקות מסוימות או לטכניקת אחסון מסוימת. די בכך שהמצב נשמר בין בקשות כל עוד תהליך השירות פועל.',
  },
  {
    context: 'לאחר פתיחת המשחק, הממשק צריך להיות מסוגל לבקש שוב את המצב הנוכחי—למשל אחרי רענון תצוגה—מבלי לפתוח משחק חדש ומבלי לשנות דבר. התרגיל מפריד במכוון בין יצירה לבין קריאה של מצב קיים.',
    journey: [
      'משחק תקין כבר נוצר ונשמר במסגרת תרגיל 2.',
      'הממשק שולח GET כדי לקרוא את המשחק הפעיל.',
      'השירות מחזיר את אותו GameState שנשמר, ללא תנועה, חיוב או אירוע חדש.',
      'קריאות חוזרות מחזירות אותו מצב עד שפעולת משחק אחרת משנה אותו.',
      'אם עדיין אין משחק פעיל, מוחזרת שגיאת 404 עם הודעה מתאימה שמסבירה את השגיאה.',
    ],
    terms: [
      'Stored state — המצב האחרון שהשרת זוכר בין שתי בקשות HTTP נפרדות.',
      'Read-only request — בקשה שמחזירה מידע אך אינה משנה אותו.',
      '404 Not Found — תשובה שמודיעה כי המשאב המבוקש, במקרה זה משחק פעיל, אינו קיים.',
    ],
    boundary: 'אין ליצור משחק מתוך GET ואין להוסיף מנגנון היסטוריה. נדרשת רק שליפה אמינה של המשחק הפעיל הנוכחי.',
  },
  {
    context: 'כעת השחקן הנוכחי לוחץ Roll. המשתמש מצפה שהשרת יקבע תוצאת קובייה, יזיז רק את השחקן שבתור, יטפל במעבר בקצה המסלול ויחזיר מצב חדש שהממשק יכול להציג מיד.',
    journey: [
      'הפעולה זמינה רק כאשר roll מופיעה ב-available_actions.',
      'מתקבלת תוצאה חוקית בין 1 ל-6 והשחקן הנוכחי מתקדם בהתאם.',
      'הלוח הוא מסלול מעגלי: כששחקן מסיים את הלוח הוא ממשיך מתחילתו לסיבוב נוסף, והשלמת הסיבוב דרך Start מעניקה 200.',
      'השירות שומר את המיקום והכסף החדשים ומחזיר אותם בתוך state.',
      'בדיקות ה-HTTP קוראות את תוצאת הקובייה שהשרת דיווח ובודקות שהיא בטווח 1–6 ושהתנועה תואמת לה.',
    ],
    terms: [
      'Circular board — מסלול שבו המיקום שאחרי 15 הוא 0.',
      'available_actions — רשימת הפעולות החוקיות שהשרת מאשר ברגע הנוכחי.',
      'Dice result — המספר האקראי 1–6 שהשרת הגריל ודיווח ביומן האירועים.',
      'event_log — רשימת האירועים שנמצאת בתוך GameState ושומרת אותם לפי סדר התרחשותם.',
    ],
    boundary: 'התרגיל עוסק בקובייה, תנועה ובונוס Start בלבד. ההשפעה המלאה של המשבצת שאליה מגיעים מתווספת בתרגיל הבא.',
  },
  {
    context: 'תנועה לבדה אינה מספיקה למשחק. כאשר שחקן נוחת על משבצת, המשתמש מצפה שהסוג שלה יקבע מה יקרה לכסף ולאילו פעולות אפשר להמשיך. תרגיל זה מרחיב את תוצאת ה-roll הקיימת, בלי להציג אותה כפעולה חדשה.',
    journey: [
      'השחקן מבצע roll ונוחת על משבצת מזוהה.',
      'משבצת reward מוסיפה כסף, penalty מפחיתה כסף ו-surprise מפעילה תוצאה חוקית ומדווחת.',
      'נכס פנוי אינו נקנה אוטומטית; השרת מציע buy ו-end_turn.',
      'האירוע האחרון מתאר בשפה ברורה מה קרה ונוסף לסוף יומן האירועים.',
      'המצב המעודכן נשמר ומוחזר לממשק באותה תשובה.',
    ],
    terms: [
      'Tile effect — השינוי במצב המשחק שנגרם כתוצאה מנחיתה על סוג משבצת מסוים.',
      'amount — סכום הכסף שמשבצת reward או penalty מוסיפה או מפחיתה.',
      'event_log — רשימה כרונולוגית של אירועי המשחק; last_event הוא תמיד האירוע האחרון בה.',
    ],
    boundary: 'אין לקנות נכס במסגרת roll ואין לחשב שכירות עדיין. בשלב זה מזהים נכס פנוי ומציעים את הפעולות הבאות בלבד.',
  },
  {
    context: 'לאחר נחיתה על נכס פנוי, הממשק מציג כפתור Buy רק מפני שהשרת כלל buy ברשימת הפעולות הזמינות. כאשר המשתמש בוחר לקנות, הוא מצפה שהמחיר, הבעלות ורשימת הנכסים יתעדכנו יחד ושהתוצאה תישמר.',
    journey: [
      'השחקן כבר עומד על property פנוי ו-buy זמינה.',
      'בקשת הקנייה מאשרת שהנכס עדיין זמין ושיש לשחקן מספיק כסף.',
      'המחיר יורד מכסף השחקן והבעלות מופיעה גם במשבצת וגם ברשימת נכסי השחקן.',
      'השרת מוסיף אירוע קנייה ומאפשר לאחר מכן רק end_turn.',
      'בקשה שאינה חוקית נדחית ב-409 וכל הערכים נשארים כפי שהיו.',
    ],
    terms: [
      'price — הסכום שהקונה משלם פעם אחת כדי לקבל בעלות.',
      'owner_id — מזהה השחקן שבבעלותו הנכס; null מציין נכס פנוי.',
      'owned_tile_ids — רשימת מזהי הנכסים שבבעלות שחקן.',
      '409 Conflict — הפעולה מובנת, אך אינה חוקית במצב המשחק הנוכחי.',
    ],
    boundary: 'אין לבחור נכס אחר ואין לקנות מראש. הפעולה מתייחסת רק לנכס שעליו עומד השחקן הנוכחי ורק כאשר buy זמינה.',
  },
  {
    context: 'משחק מרובה משתתפים חייב להעביר שליטה באופן ברור. אחרי שהשחקן סיים את פעולתו, המשתמש מצפה שהתור יעבור לשחקן הפעיל הבא. אם שחקן נוחת על נכס של אחר, התשלום צריך לעבור בין שניהם באופן עקבי.',
    journey: [
      'השחקן מסיים את הפעולות המותרות בתורו ושולח end-turn.',
      'השרת בוחר את השחקן הפעיל הבא, ובסוף הרשימה חוזר לראשיתה.',
      'בתחילת התור החדש roll היא הפעולה היחידה.',
      'אם השחקן החדש נוחת על נכס של שחקן אחר, rent יורד ממנו ומתווסף לבעלים באותו סכום.',
      'פעולה שנשלחה בזמן לא מתאים נדחית ב-409 ואינה משנה את המשחק.',
    ],
    terms: [
      'Turn — חלון הפעולות של שחקן אחד לפני שהשליטה עוברת לבא אחריו.',
      'rent — תשלום מבקר לבעל נכס כאשר המבקר נוחת עליו.',
      'Current player — השחקן היחיד שמורשה לבצע את פעולת המשחק הבאה.',
    ],
    boundary: 'אין לאפשר לממשק לבחור מי הבא בתור או לחשב שכירות. השרת מחזיר את התוצאה הסופית ומדלג על שחקנים שאינם פעילים.',
  },
  {
    context: 'התרגיל האחרון מחבר את כל ההתנהגויות למשחק שאפשר להתחיל, לשחק ולסיים. המשתמש צריך לראות מתי שחקן פשט רגל, מי ניצח, ולדעת שאחרי הסיום אי אפשר להמשיך לפעול עד לאיפוס.',
    journey: [
      'המשחק מתקדם דרך יצירה, תנועה, השפעות, קנייה, תורות ושכירות.',
      'שחקן שכספו ירד מתחת לאפס מסומן כפושט רגל ומפסיק לקבל תורות.',
      'כאשר נשאר שחקן פעיל אחד, המשחק עובר ל-finished ומציג winner_id.',
      'במצב finished אין פעולות משחק זמינות ובקשות נוספות נדחות בלי לשנות את התוצאה.',
      'Reset מוחק את המשחק הפעיל ומחזיר מצב not_started ריק שמוכן לפתיחה חדשה.',
    ],
    terms: [
      'Lifecycle — רצף המצבים not_started, active ו-finished.',
      'Bankruptcy — מצב שבו שחקן אינו פעיל עוד ואינו משתתף בסבב התורות.',
      'winner_id — מזהה המנצח; הוא null עד שהמשחק מסתיים.',
      'Reset — פעולה שמחזירה את השירות למצב ללא משחק פעיל.',
    ],
    boundary: 'אין להוסיף חוקים מעבר לחוזה שנלמד. הצלחה פירושה שכל היכולות הקודמות פועלות יחד והשרת נשאר מקור האמת היחיד.',
  },
];

const endTurnExercise = {
  file: '05_end_turn.docx',
  title: 'תרגיל 5: סיום תור ומעבר בין שחקנים',
  goal: 'לאפשר לשחקן שסיים לזרוק להעביר את השליטה לשחקן הבא ולהמשיך משחק לאורך מספר תורות.',
  requirements: [
    'POST /api/game/end-turn אינה מקבלת גוף והיא חוקית רק כאשר end_turn מופיעה ב-available_actions.',
    'סיום תור מעביר את current_player_id לשחקן הבא לפי סדר המזהים; לאחר האחרון חוזרים לראשון.',
    'בתחילת התור החדש available_actions היא בדיוק ["roll"].',
    'end-turn לפני roll מחזירה 409 עם הודעה מתאימה ואינה משנה את מצב המשחק.',
    'לאורך מספר תורות, מעבר דרך Start מוסיף 200 ואירוע התנועה מכיל received 200 for Start.',
  ],
  endpoints: [{
    method: 'POST', path: '/api/game/end-turn', what: 'סיום התור ומעבר לשחקן הבא.', status: '200 OK או 409', request: [],
    response: jsonLines({ state: fullGameState({
      currentPlayerId: 2,
      availableActions: ['roll'],
      lastEvent: "It is now Linus's turn.",
      eventLog: ['Game created. Roll to begin.', 'Ada rolled 3 and moved to 3.', "It is now Linus's turn."],
    }) }),
  }],
  checks: [
    'לאחר roll, קריאת end-turn מעבירה לשחקן הבא ומחזירה roll כפעולה היחידה.',
    'לאחר השחקן האחרון התור חוזר לשחקן הראשון.',
    'end-turn לפני roll מחזירה 409 ללא שינוי מצב.',
    'הרצת תורות רצופים מאפשרת לבדוק מעבר דרך Start ואת בונוס 200.',
  ],
};

exercises[3].requirements = exercises[3].requirements.map((text) => (
  text.includes('POST /api/game/end-turn')
    ? 'לאחר הזריקה available_actions מכילה end_turn בלבד; פעולת end-turn עצמה מתווספת בתרגיל 5.'
    : text
));
exercises[3].endpoints = exercises[3].endpoints.filter((endpoint) => endpoint.path !== '/api/game/end-turn');
exercises.splice(4, 0, endTurnExercise);

Object.assign(exercises[5], {
  file: '06_tile_effects.docx',
  title: 'תרגיל 6: השפעות משבצות',
  requirements: exercises[5].requirements.map((text) => text.replace('שתמומש בתרגיל 6', 'שתמומש בתרגיל 7')),
});
Object.assign(exercises[6], {
  file: '07_buy_property.docx',
  title: 'תרגיל 7: קניית נכס',
});
Object.assign(exercises[7], {
  file: '08_rent.docx',
  title: 'תרגיל 8: שכירות',
  goal: 'להעביר שכירות כאשר שחקן נוחת על נכס של שחקן אחר.',
  requirements: [
    'אין נקודת קצה חדשה: POST /api/game/roll מפעילה שכירות בעת נחיתה על נכס תפוס.',
    'rent יורד מהשוכר ומתווסף לבעלים באותה פעולה; נחיתה על נכס עצמי אינה מעבירה כסף.',
    'אם השוכר עבר Start, מוסיפים תחילה 200 ולאחר מכן מפחיתים שכירות.',
    'אירוע שכירות מתאים למבנה <renter> paid <rent> rent to <owner> for <property>.',
    'לאחר תשלום שכירות available_actions שווה בדיוק ל-["end_turn"].',
  ],
  endpoints: [{
    method: 'POST', path: '/api/game/roll', what: 'תנועה והעברת שכירות בעת נחיתה על נכס תפוס.', status: '200 OK או 409', request: [],
    response: ['{"state": GameState}'],
  }],
  checks: [
    'השכירות יורדת ועולה באותו סכום אצל שני השחקנים.',
    'נחיתה על נכס עצמי אינה משנה כסף.',
    'last_event זהה לאיבר האחרון ב-event_log.',
  ],
});
Object.assign(exercises[8], {
  file: '09_complete_game.docx',
  title: 'תרגיל 9: מחזור חיים ומשחק מלא',
  checks: exercises[8].checks.map((text) => text.replace('שמונת ה-checkpoints', 'תשעת ה-checkpoints')),
});

learningMetadata.splice(4, 0, {
  duration: '45–60 דקות',
  prerequisites: ['השלמת תרגיל 4.', 'הבנת סדר מחזורי.'],
  concepts: ['מעבר תור.', 'אכיפת available_actions.'],
  errors: ['end-turn לפני roll מחזיר 409.', 'פעולה שנדחתה אינה משנה מצב.'],
  submission: ['פלט בדיקות תרגיל 5 מתוך ה-UI.', 'רצף שמציג מעבר לשחקן הבא וחזרה לראשון.'],
});
Object.assign(learningMetadata[5], {
  prerequisites: ['השלמת תרגיל 5.', 'הבנת פולימורפיזם או Strategy.'],
  submission: ['פלט בדיקות תרגיל 6 מתוך ה-UI.', 'דוגמאות לתגמול, קנס והפתעה.'],
});
Object.assign(learningMetadata[6], {
  prerequisites: ['השלמת תרגיל 6.', 'הבנת בעלות ועדכון אטומי.'],
  submission: ['פלט בדיקות תרגיל 7 מתוך ה-UI.', 'מצב לפני ואחרי קנייה.'],
});
Object.assign(learningMetadata[7], {
  prerequisites: ['השלמת תרגיל 7.', 'הבנת העברת כסף בין שחקנים.'],
  concepts: ['שכירות והעברת כסף.', 'עקביות מצב המשחק לאחר תשלום.'],
  submission: ['פלט בדיקות תרגיל 8 מתוך ה-UI.', 'רצף שמציג תשלום שכירות.'],
});
Object.assign(learningMetadata[8], {
  prerequisites: ['השלמת תרגיל 8.', 'הבנת מחזור החיים של המשחק.'],
  submission: ['פלט של checkpoint 9.', 'הדגמה מלאה דרך הממשק וצילום מסך.'],
});

instructorHints.splice(4, 0, [
  'בדקו קודם מעבר לשחקן הבא ורק לאחר מכן חזרה מסוף הרשימה.',
  'ודאו ש-end-turn לפני roll נדחית ללא שינוי.',
  'השתמשו ברצף תורות כדי לצפות במעבר דרך Start.',
]);

exerciseNarratives[3].boundary = 'התרגיל עוסק בקובייה ובתנועה בלבד. מעבר תור מתווסף בתרגיל 5 והשפעות המשבצות בתרגיל 6.';
exerciseNarratives.splice(4, 0, {
  context: 'לאחר הזריקה השחקן סיים את פעולתו. כדי שהמשחק יוכל להמשיך, השרת צריך להעביר את השליטה לשחקן הבא ולהחזיר את roll כפעולה הזמינה.',
  journey: [
    'השחקן מבצע roll ומקבל end_turn כפעולה הזמינה היחידה.',
    'הממשק שולח POST /api/game/end-turn ללא גוף.',
    'השרת מעביר את current_player_id לשחקן הבא ומחזיר available_actions עם roll בלבד.',
    'בסוף רשימת השחקנים התור חוזר לשחקן הראשון.',
    'בקשה מוקדמת לסיום תור נדחית ב-409 ללא שינוי מצב.',
  ],
  terms: [
    'Turn — חלון הפעולות של שחקן אחד לפני שהשליטה עוברת לבא אחריו.',
    'Turn order — סדר השחקנים הקבוע שלפיו current_player_id מתקדם.',
    '409 Conflict — פעולה מובנת שאינה חוקית במצב המשחק הנוכחי.',
  ],
  boundary: 'בשלב זה מממשים מעבר תור בלבד. השפעות משבצות, קנייה ושכירות מתווספות בתרגילים הבאים.',
});

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' };

function heRun(text, options = {}) {
  return new TextRun({
    text,
    rightToLeft: true,
    font: 'Arial',
    language: { bidirectional: 'he-IL' },
    ...options,
  });
}

function rtlParagraph(text, options = {}) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: 120, line: 300 },
    children: [heRun(text, options.run || {})],
    ...options.paragraph,
  });
}

function heading(text, level, paragraph = {}) {
  return new Paragraph({
    heading: level,
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    children: [heRun(text, { bold: true })],
    ...paragraph,
  });
}

function list(items, reference) {
  return items.map((text) => new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    numbering: { reference, level: 0 },
    spacing: { after: 80, line: 300 },
    children: [heRun(text)],
  }));
}

function code(lines) {
  return lines.map((line, index) => new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: index === 0 ? 80 : 0, after: index === lines.length - 1 ? 120 : 0 },
    shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
    indent: { left: 240, right: 240 },
    children: [new TextRun({ text: line, font: 'Consolas', size: 19 })],
  }));
}

function endpointBlock(endpoint, index) {
  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: `${endpoint.method} ${endpoint.path}`, font: 'Consolas', bold: true })],
    }),
    rtlParagraph(`מטרה: ${endpoint.what}`),
    rtlParagraph(`תוצאה צפויה: ${endpoint.status}`),
  ];
  if (endpoint.request.length) {
    children.push(heading('דוגמת בקשה', HeadingLevel.HEADING_3));
    children.push(...code(endpoint.request));
  } else {
    children.push(rtlParagraph('אין גוף בקשה.'));
  }
  children.push(heading('דוגמת תשובה', HeadingLevel.HEADING_3));
  children.push(...code(endpoint.response));
  if (endpoint.responseNote) {
    children.push(rtlParagraph(endpoint.responseNote, { run: { bold: true, color: '1E3A5F' } }));
  }
  return children;
}

function createDocument(exercise, index) {
  const meta = learningMetadata[index];
  const narrative = exerciseNarratives[index];
  const exerciseCompletionItems = index === 1
    ? [
      'חוזה היצירה המלא ובדיקות תרגילים 1–2 עוברים ללא שינוי של מבנה הבקשה או התשובה.',
      'בדקתי יצירה תקינה וקלט שנדחה, שמרתי את תוצאות הבדיקה ואני מסוגל להסביר את משמעות השדות שהוחזרו.',
    ]
    : index === 7 ? completionItems.slice(0, 3) : completionItems;
  const children = [
    rtlParagraph(`תרגיל ${index + 1} מתוך ${exercises.length}`, { run: { bold: true, color: '2563EB', size: 20 }, paragraph: { spacing: { after: 60 } } }),
    rtlParagraph(exercise.title, { run: { bold: true, color: '1E3A5F', size: 44 }, paragraph: { spacing: { after: 120 } } }),
    rtlParagraph(exercise.goal, { run: { size: 24 }, paragraph: { spacing: { after: 220 } } }),
    rtlParagraph('המסמך מגדיר מה המערכת צריכה לעשות ומה היא צריכה להחזיר. בחירת דרך המימוש היא באחריותכם.', {
      run: { bold: true, color: '1E3A5F' },
      paragraph: { shading: { fill: 'EFF6FF', type: ShadingType.CLEAR }, indent: { left: 160, right: 160 }, spacing: { before: 80, after: 180, line: 300 } },
    }),
    heading('המשימה בשפה פשוטה', HeadingLevel.HEADING_1),
    rtlParagraph(narrative.context),
    heading('מה המשתמש מצפה שיקרה', HeadingLevel.HEADING_2),
    ...list(narrative.journey, 'journey-' + index),
    heading('מונחים מקצועיים במסמך', HeadingLevel.HEADING_2),
    ...list(narrative.terms, 'terms-' + index),
    rtlParagraph('גבולות המשימה: ' + narrative.boundary, {
      run: { bold: true, color: '365314' },
      paragraph: { shading: { fill: 'F7FEE7', type: ShadingType.CLEAR }, indent: { left: 160, right: 160 }, spacing: { before: 80, after: 180, line: 300 } },
    }),
    heading('מטרות והיערכות', HeadingLevel.HEADING_1),
    rtlParagraph('זמן משוער: ' + meta.duration, { run: { bold: true } }),
    heading('ידע מוקדם', HeadingLevel.HEADING_2),
    ...list(meta.prerequisites, 'prerequisites-' + index),
    heading('מה נבדק בתרגיל', HeadingLevel.HEADING_2),
    ...list(meta.concepts, 'concepts-' + index),
    heading('דרישות התרגיל', HeadingLevel.HEADING_1),
    ...list(exercise.requirements, `requirements-${index}`),
    heading('נקודות הקצה', HeadingLevel.HEADING_1),
    ...exercise.endpoints.flatMap(endpointBlock),
    heading('בדיקות קבלה', HeadingLevel.HEADING_1),
    ...list(exercise.checks, `checks-${index}`),
    heading('מקרי שגיאה שחייבים לבדוק', HeadingLevel.HEADING_1),
    ...list(meta.errors, 'errors-' + index),
    heading('מה מגישים', HeadingLevel.HEADING_1),
    ...list(meta.submission, 'submission-' + index),
    heading('רשימת בדיקה לסיום', HeadingLevel.HEADING_1, index === 1 ? { pageBreakBefore: true } : {}),
    ...list(exerciseCompletionItems, 'completion-' + index),
  ];

  return new Document({
    creator: 'Property Empire Classroom',
    title: exercise.title,
    description: 'תרגילי Backend ב-FastAPI - דרישות והתנהגות בלבד',
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: 'Arial', size: 32, bold: true, color: '2E74B5' },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: 'Arial', size: 26, bold: true, color: '2E74B5' },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: 'Arial', size: 24, bold: true, color: '1F4D78' },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
      ],
    },
    numbering: {
      config: [
        {
          reference: `requirements-${index}`,
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.RIGHT,
            style: { paragraph: { indent: { right: 540, hanging: 270 } } } }],
        },
        {
          reference: `checks-${index}`,
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.RIGHT,
            style: { paragraph: { indent: { right: 540, hanging: 270 } } } }],
        },
        ...['prerequisites', 'concepts', 'errors', 'submission', 'completion'].map((name) => ({
          reference: name + '-' + index,
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.RIGHT,
            style: { paragraph: { indent: { right: 540, hanging: 270 } } } }],
        })),
        ...['journey', 'terms'].map((name) => ({
          reference: name + '-' + index,
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.RIGHT,
            style: { paragraph: { indent: { right: 540, hanging: 270 } } } }],
        })),
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 },
        },
      },
      headers: {
        default: new Header({ children: [rtlParagraph('Property Empire | משימות Backend', { run: { size: 18, color: '64748B' } })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [heRun('עמוד ', { size: 18, color: '64748B' }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18 })],
        })] }),
      },
      children,
    }],
  });
}

function createInstructorGuide() {
  const children = [
    rtlParagraph('מדריך למורה: Property Empire', { run: { bold: true, color: '1E3A5F', size: 44 } }),
    rtlParagraph('ליווי, משוב והערכה לתרגילי Backend', { run: { size: 25 }, paragraph: { spacing: { after: 220 } } }),
    rtlParagraph('חשוב: התיקייה instructor היא סימון ארגוני בלבד ואינה פרטית. בדיקות נסתרות אמיתיות יש לשמור במערכת קורס פרטית.', {
      run: { bold: true, color: '9A3412' },
      paragraph: { shading: { fill: 'FFF7ED', type: ShadingType.CLEAR }, indent: { left: 160, right: 160 } },
    }),
    heading('עקרונות הוראה', HeadingLevel.HEADING_1),
    ...list([
      'הציגו בכל פעם רק את חוזה ההתנהגות של התרגיל הנוכחי.',
      'בקשו מהתלמיד להסביר תצפית HTTP לפני מתן רמז.',
      'תנו רמזים בהדרגה: כיוון חשיבה, נקודת בדיקה, ורק לבסוף תנאי מדויק.',
      'ה-UI מציג מצב ושולח בקשות בלבד; כל כללי המשחק שייכים לשרת.',
      'אין משימות הרחבה במסלול זה. השלמת החוזה המלא היא יעד הסיום.',
    ], 'instructor-bullets'),
  ];

  exercises.forEach((exercise, index) => {
    const meta = learningMetadata[index];
    children.push(heading(exercise.title, HeadingLevel.HEADING_1));
    children.push(rtlParagraph('זמן משוער: ' + meta.duration, { run: { bold: true } }));
    children.push(heading('תוצאה מצופה', HeadingLevel.HEADING_2));
    children.push(rtlParagraph(exercise.goal));
    children.push(heading('טעויות נפוצות ונקודות קצה', HeadingLevel.HEADING_2));
    children.push(...list(meta.errors, 'instructor-bullets'));
    children.push(heading('שלוש רמות רמז', HeadingLevel.HEADING_2));
    instructorHints[index].forEach((hint, hintIndex) => {
      children.push(rtlParagraph('רמה ' + (hintIndex + 1) + ': ' + hint, { run: { bold: hintIndex === 0 } }));
    });
    children.push(heading('מיפוי בדיקות ומשוב', HeadingLevel.HEADING_2));
    children.push(rtlParagraph('הריצו checkpoint ' + (index + 1) + '. הוא כולל את תרגילים 1–' + (index + 1) + ' ובודק רק התנהגות HTTP.'));
    children.push(rtlParagraph('ראיות ההגשה: ' + meta.submission.join(' ')));
  });

  children.push(heading('מחוון הערכה', HeadingLevel.HEADING_1));
  children.push(...list([
    'התנהגות פונקציונלית — 50%.',
    'חוזה API וטיפול בשגיאות — 20%.',
    'בהירות קוד והפרדת אחריות — 15%.',
    'ראיות בדיקה ותהליך איתור תקלות — 10%.',
    'הגשה והשתקפות — 5%.',
  ], 'instructor-bullets'));
  children.push(rtlParagraph('אין סף כיסוי קוד מספרי. הדרישה היא ראיה ממוקדת לכל כלל, מעבר מצב ומקרה שגיאה רלוונטי.', { run: { bold: true } }));

  return new Document({
    creator: 'Property Empire Classroom',
    title: 'מדריך למורה: Property Empire',
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: 'Arial', size: 32, bold: true, color: '2E74B5' },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: 'Arial', size: 26, bold: true, color: '2E74B5' },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [{
        reference: 'instructor-bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.RIGHT,
          style: { paragraph: { indent: { right: 540, hanging: 270 } } } }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 },
        },
      },
      headers: { default: new Header({ children: [rtlParagraph('Property Empire | מדריך למורה', { run: { size: 18, color: '64748B' } })] }) },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [heRun('עמוד ', { size: 18, color: '64748B' }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18 })],
        })] }),
      },
      children,
    }],
  });
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  for (const existing of fs.readdirSync(output).filter((name) => name.endsWith('.docx') && !name.startsWith('~$'))) {
    fs.unlinkSync(path.join(output, existing));
  }
  for (let index = 0; index < exercises.length; index += 1) {
    const exercise = exercises[index];
    const buffer = await Packer.toBuffer(createDocument(exercise, index));
    const target = path.join(output, exercise.file);
    fs.writeFileSync(target, buffer);
    process.stdout.write(`${target}\n`);
  }
  const instructorTarget = path.join(artifactRoot, 'instructor', 'property-empire-instructor-guide-he.docx');
  fs.mkdirSync(path.dirname(instructorTarget), { recursive: true });
  fs.writeFileSync(instructorTarget, await Packer.toBuffer(createInstructorGuide()));
  process.stdout.write(instructorTarget + '\n');
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exit(1);
});
