# תרגיל 2: יצירת משחק ומצב פתיחה

## מטרת התרגיל

לאפשר יצירת משחק חדש עבור שניים עד ארבעה שחקנים ולהחזיר מצב משחק מלא שה-UI יכול להציג ללא השלמת מידע בעצמו.

## נקודת הקצה הנדרשת

### `POST /api/game`

גוף הבקשה:

```json
{"player_names": ["Ada", "Linus"]}
```

בקשה תקינה מחזירה `200` ואת `GameState` ישירות, ללא מעטפת נוספת.

## אימות שמות השחקנים

יש לבצע את כל הבדיקות הבאות לפני החלפת המשחק הפעיל:

- מספר השמות הוא 2–4. רשימה של שחקן אחד או חמישה שחקנים מחזירה `422`.
- מסירים רווחים מתחילת כל שם ומסופו.
- שם ריק, או שם שהופך לריק לאחר הסרת רווחים, מחזיר `422`.
- שמות כפולים מחזירים `422`, גם אם ההבדל הוא רק אותיות גדולות/קטנות, למשל `Ada` ו-`ada`.
- כל תגובת `422` כוללת גוף JSON עם המפתח `detail`.

## מבנה `GameState`

האובייקט חייב להכיל בדיוק את שמונת המפתחות הבאים, ללא מפתחות חסרים או נוספים:

- `status`: מתחיל כ-`active`.
- `current_player_id`: מתחיל כ-`1`.
- `winner_id`: מתחיל כ-`null`.
- `available_actions`: מתחיל כ-`["roll"]`.
- `players`: רשימה לפי סדר השמות בבקשה.
- `board`: רשימה מסודרת של 16 משבצות.
- `last_event`: מתחיל כ-`Game created. Roll to begin.`.
- `event_log`: רשימה שמתחילה עם אותו אירוע.

כל שחקן מקבל `id` החל מ-1, `money` בערך 1500, `position` בערך 0, ‏`is_bankrupt` בערך `false` ו-`owned_tile_ids` כרשימה ריקה.

## הלוח הנדרש

`id` הוא גם מיקום המשבצת במסלול המעגלי. נכס כולל `price`, ‏`rent` ו-`owner_id: null`; פרס או קנס כוללים `amount`. שמות התצוגה יכולים להיות בעברית או באנגלית, אך עליהם להיות יציבים ולהופיע באופן עקבי במצב ובאירועים. הטבלה מציגה שמות אנגליים תקינים ואת הערכים הנדרשים.

| id | name | type | נתונים נוספים |
|---:|---|---|---|
| 0 | Start | start | — |
| 1 | Jordan | property | price 100, rent 20 |
| 2 | Cultural Festival | reward | amount 100 |
| 3 | Cairo | property | price 120, rent 24 |
| 4 | Customs | penalty | amount 350 |
| 5 | United Arab Emirates | property | price 140, rent 28 |
| 6 | Desert Surprise | surprise | — |
| 7 | Dubai | property | price 160, rent 32 |
| 8 | Oil Deal | reward | amount 150 |
| 9 | Morocco | property | price 180, rent 36 |
| 10 | Port Tax | penalty | amount 450 |
| 11 | Beirut | property | price 200, rent 40 |
| 12 | Thriving Tourism | reward | amount 200 |
| 13 | Doha | property | price 220, rent 44 |
| 14 | Market Surprise | surprise | — |
| 15 | Luxury Tax | penalty | amount 650 |

## כיצד לוודא שהתרגיל הושלם

בדקו יצירה עם 2, 3 ו-4 שחקנים ואת ארבעת מקרי הקלט הלא תקין שמפורטים למעלה. השוו את כל שמונת שדות המצב, את כל שדות השחקנים ואת כל 16 המשבצות—לא רק את קוד התגובה.
