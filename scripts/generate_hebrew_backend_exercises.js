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
      'השחקן הנוכחי מתקדם לפי התוצאה על לוח מעגלי של 16 משבצות.',
      'מעבר דרך Start מעניק 200 כסף.',
      'לאחר הזריקה יש לעדכן את הפעולות הזמינות לפי המשבצת שעליה השחקן נחת.',
      'התשובה כוללת את מצב המשחק המלא בתוך השדה state.',
    ],
    endpoints: [
      {
        method: 'POST', path: '/api/game/roll',
        what: 'זריקת קובייה ותזוזת השחקן הנוכחי.', status: '200 OK', request: [],
        response: [
          '{',
          '  \u0022state\u0022: {',
          '    \u0022current_player_id\u0022: 1,',
          '    \u0022available_actions\u0022: [\u0022buy\u0022, \u0022end_turn\u0022],',
          '    \u0022players\u0022: [{\u0022id\u0022: 1, \u0022position\u0022: 3, \u0022money\u0022: 1500}],',
          '    \u0022last_event\u0022: \u0022Ada rolled 3 and moved to 3.\u0022',
          '  }',
          '}',
        ],
      },
    ],
    checks: [
      'המיקום החדש תמיד נמצא בין 0 ל-15.',
      'מעבר ממיקום 14 בתוצאה 3 מסתיים במיקום 1 ומוסיף 200.',
      'רק השחקן הנוכחי זז.',
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
    errors: ['ערך X-Test-Dice-Roll מחוץ לטווח 1–6 מחזיר 422 ללא שינוי מצב.', 'roll שאינו זמין מחזיר 409.'],
    submission: ['פלט של checkpoint 4 כאשר מצב הבדיקות פעיל.', 'דוגמת תנועה עם ערך קובייה קבוע.'],
  },
  {
    duration: '75–105 דקות',
    prerequisites: ['השלמת תרגיל 4.', 'הבנת בעלות ופעולה מותנית.'],
    concepts: ['סוגי משבצות.', 'עדכון אטומי של כסף ובעלות.'],
    errors: ['buy שאינו זמין מחזיר 409 ללא שינוי מצב.', 'אי אפשר לקנות משבצת שאינה נכס, נכס תפוס או נכס יקר מדי.'],
    submission: ['פלט של checkpoint 5.', 'מצב לפני ואחרי קנייה שמראה כסף, owner_id ו-owned_tile_ids.'],
  },
  {
    duration: '75–120 דקות',
    prerequisites: ['השלמת תרגיל 5.', 'הבנת השפעות כספיות ורישום אירועים.'],
    concepts: ['שכירות והעברת כסף.', 'Reward, Penalty, Surprise ועקביות יומן האירועים.'],
    errors: ['השפעה אינה יכולה להשאיר מיקום מחוץ ללוח.', 'last_event חייב להיות הרשומה האחרונה ב-event_log.'],
    submission: ['פלט של checkpoint 6.', 'דוגמאות לתגמול, קנס, שכירות והפתעה.'],
  },
  {
    duration: '60–90 דקות',
    prerequisites: ['השלמת תרגיל 6.', 'הבנת מכונת מצבים פשוטה.'],
    concepts: ['סבב תורות ופעולות זמינות.', 'שגיאות דומיין ללא שינוי מצב.'],
    errors: ['פעולה שאינה ב-available_actions מחזירה 409.', 'GET ללא משחק מחזיר 404; שחקן שפשט רגל אינו מקבל תור.'],
    submission: ['פלט של checkpoint 7.', 'רצף בקשות שמראה מעבר תור ושגיאה שאינה משנה מצב.'],
  },
  {
    duration: '75–120 דקות',
    prerequisites: ['השלמת תרגילים 1–7.', 'יכולת לחבר את כל כללי המשחק לחוזה אחד יציב.'],
    concepts: ['פשיטת רגל, ניצחון ואיפוס.', 'שרת כמקור האמת היחיד עבור הממשק.'],
    errors: ['לאחר סיום המשחק אין פעולות זמינות.', 'reset מחזיר מצב not_started מלא ועקבי.'],
    submission: ['פלט של checkpoint 8.', 'הדגמה מלאה דרך הממשק וצילום מסך.', 'השתקפות קצרה: החלטה אחת, תקלה אחת ומה למדתם.'],
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
  ['התחילו מתנועה אחת עם ערך קבוע ורק אחר כך בדקו לולאה סביב הלוח.', 'הזכירו שמיקום חדש מחושב על לוח בן 16 משבצות.', 'במצב בדיקות הכותרת קובעת 1–6; ערך פסול מחזיר 422 ללא שינוי.'],
  ['בקשו לזהות אילו שלושה ערכים חייבים להשתנות יחד בקנייה.', 'השוו מחיר הנכס להפרש בכסף ובדקו את שתי תצוגות הבעלות.', 'קנייה מעדכנת money, owner_id ו-owned_tile_ids באותה בקשה.'],
  ['בדקו כל סוג משבצת בנפרד לפני רצף משחק מלא.', 'בשכירות השוו את הירידה אצל השוכר לעלייה אצל הבעלים.', 'לאחר כל השפעה last_event חייב להיות האיבר האחרון ב-event_log.'],
  ['השתמשו ב-available_actions כרשימת ההרשאות של המצב הנוכחי.', 'שמרו צילום מצב לפני פעולה אסורה והשוו אחריה.', 'פעולה אסורה מחזירה 409 ואינה משנה כסף, מיקום, בעלות או תור.'],
  ['הריצו תרחיש ארוך דרך HTTP בלבד.', 'בדקו בנפרד פשיטת רגל, דילוג, מנצח ואיפוס.', 'כאשר נשאר שחקן פעיל אחד המשחק finished, אין פעולות, ו-reset מחזיר not_started.'],
];

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

function heading(text, level) {
  return new Paragraph({
    heading: level,
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    children: [heRun(text, { bold: true })],
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
  return children;
}

function createDocument(exercise, index) {
  const meta = learningMetadata[index];
  if (index === 3) {
    exercise = {
      ...exercise,
      requirements: [
        ...exercise.requirements,
        'כאשר PROPERTY_EMPIRE_TESTING שווה 1, הכותרת האופציונלית X-Test-Dice-Roll עם ערך 1–6 קובעת את תוצאת הזריקה לבקשה זו. ללא הכותרת הזריקה אקראית; מחוץ למצב בדיקות הכותרת אינה משפיעה.',
      ],
    };
  }
  const children = [
    rtlParagraph(`תרגיל ${index + 1} מתוך ${exercises.length}`, { run: { bold: true, color: '2563EB', size: 20 }, paragraph: { spacing: { after: 60 } } }),
    rtlParagraph(exercise.title, { run: { bold: true, color: '1E3A5F', size: 44 }, paragraph: { spacing: { after: 120 } } }),
    rtlParagraph(exercise.goal, { run: { size: 24 }, paragraph: { spacing: { after: 220 } } }),
    rtlParagraph('המסמך מגדיר מה המערכת צריכה לעשות ומה היא צריכה להחזיר. בחירת דרך המימוש היא באחריותכם.', {
      run: { bold: true, color: '1E3A5F' },
      paragraph: { shading: { fill: 'EFF6FF', type: ShadingType.CLEAR }, indent: { left: 160, right: 160 }, spacing: { before: 80, after: 180, line: 300 } },
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
    heading('רשימת בדיקה לסיום', HeadingLevel.HEADING_1),
    ...list(completionItems, 'completion-' + index),
    heading('תנאי סיום', HeadingLevel.HEADING_1),
    rtlParagraph('התרגיל הושלם כאשר כל הדרישות ובדיקות הקבלה מתקיימות, בלי לשנות את חוזה הבקשות והתשובות.', { run: { bold: true } }),
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
