const fs = require("fs");
const path = require("path");
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
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require("docx");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "exercise-answers");
const contentWidth = 9026;

const answers = [
  {
    file: "01_health_check_answer.docx",
    title: "תרגיל 1: שירות פעיל ובדיקת תקינות",
    task: "ליצור שירות HTTP ראשון עבור Sigit Empire ולהוכיח שהוא זמין באמצעות GET /api/health.",
    criteria: [
      "הנתיב GET /api/health מחזיר 200 OK.",
      "גוף התשובה הוא בדיוק אובייקט JSON עם status בערך ok.",
      "התגובה מסומנת כתוכן מסוג application/json.",
    ],
    explanation: [
      "בדיקת תקינות היא נקודת הקצה הפשוטה ביותר בשירות. היא אינה קוראת מצב משחק ואינה מפעילה חוק עסקי; היא רק מוכיחה שתהליך ה־API עלה ושהניתוב עובד.",
      "FastAPI ממיר מילון Python לתשובת JSON ומחזיר 200 כברירת מחדל. שימוש במודל תגובה מקבע את החוזה ומונע שינוי מקרי של המפתח או הערך.",
    ],
    code: [
      {
        label: "app/main.py",
        text: `from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"


app = FastAPI(title="Sigit Empire API")


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()`,
      },
    ],
    why: [
      "הנתיב והשיטה תואמים במדויק לחוזה.",
      "מודל התגובה מבטיח JSON יציב: {\"status\": \"ok\"}.",
      "אין תלות במשחק ולכן הבדיקה נשארת זמינה גם לפני שנוצר משחק.",
    ],
    verify: [
      "uvicorn app.main:app --reload --port 8123",
      "curl -i http://localhost:8123/api/health",
      "הריצו מה־UI את בדיקת תרגיל 1.",
    ],
  },
  {
    file: "02_create_game_answer.docx",
    title: "תרגיל 2: יצירת משחק חדש",
    task: "לקבל 2–4 שמות, לאמת אותם, ליצור GameState התחלתי מלא עם 16 משבצות ולשמור אותו כמשחק הפעיל.",
    criteria: [
      "POST /api/game מקבל player_names, מסיר רווחים ודוחה שמות ריקים או כפולים ב־422.",
      "השחקנים מתחילים עם 1500, מיקום 0 וללא נכסים; השחקן הראשון מקבל את התור.",
      "הלוח מכיל מזהים 0–15, כולל מדינות ערב וערים ערביות מוכרות שניתן לרכוש.",
      "התשובה מחזירה GameState מלא ושומרת את אותו אובייקט בזיכרון.",
    ],
    explanation: [
      "הבקשה מתארת רק את הקלט שמגיע מהלקוח. מודל Pydantic מטפל בכללי הצורה והוולידציה לפני שנוגעים במצב הקיים, ולכן בקשה שגויה אינה מוחקת משחק תקין.",
      "שירות המשחק יוצר אובייקטי שחקן לפי סדר השמות, מבקש מהמפעל לוח קבוע בן 16 משבצות, מוסיף אירוע פתיחה ושומר את המשחק במאגר יחיד בזיכרון.",
      "GameState הוא צילום מלא של השרת. הממשק אינו משלים שדות בעצמו ולכן כל השדות מוחזרים כבר ביצירה.",
    ],
    code: [
      {
        label: "app/schemas/game_schemas.py — ולידציית הקלט",
        text: `from pydantic import BaseModel, Field, field_validator, model_validator


class CreateGameRequest(BaseModel):
    player_names: list[str] = Field(min_length=2, max_length=4)

    @field_validator("player_names")
    @classmethod
    def clean_names(cls, names: list[str]) -> list[str]:
        cleaned = [name.strip() for name in names]
        if any(not name for name in cleaned):
            raise ValueError("Player names cannot be empty.")
        return cleaned

    @model_validator(mode="after")
    def unique_names(self):
        normalized = [name.casefold() for name in self.player_names]
        if len(normalized) != len(set(normalized)):
            raise ValueError("Player names must be unique.")
        return self`,
      },
      {
        label: "game_engine/factories/board_factory.py — הלוח",
        text: `def create_board(self) -> list[Tile]:
    return [
        StartTile(0, "נקודת יציאה"),
        PropertyTile(1, "ירדן", 100, 20),
        RewardTile(2, "פסטיבל תרבות", 100),
        PropertyTile(3, "קהיר", 120, 24),
        PenaltyTile(4, "מכס", 100),
        PropertyTile(5, "איחוד האמירויות", 140, 28),
        SurpriseTile(6, "הפתעה במדבר"),
        PropertyTile(7, "דובאי", 160, 32),
        RewardTile(8, "עסקת נפט", 150),
        PropertyTile(9, "מרוקו", 180, 36),
        PenaltyTile(10, "מס נמל", 75),
        PropertyTile(11, "ביירות", 200, 40),
        RewardTile(12, "תיירות משגשגת", 200),
        PropertyTile(13, "דוחה", 220, 44),
        SurpriseTile(14, "הפתעה בשוק"),
        PenaltyTile(15, "מס יוקרה", 150),
    ]`,
      },
      {
        label: "שירות ונתיב היצירה",
        text: `def create_game(self, player_names: list[str]) -> Game:
    players = [
        Player(id=index + 1, name=name)
        for index, name in enumerate(player_names)
    ]
    game = Game(players=players, board=self.board_factory.create_board())
    game.add_event("Game created. Roll to begin.")
    return self.repository.save(game)


@router.post("/game", response_model=GameStateResponse)
def create_game(request: CreateGameRequest, service=Depends(get_game_service)):
    game = service.create_game(request.player_names)
    return GameStateResponse.model_validate(game.to_dict())`,
      },
    ],
    why: [
      "הוולידציה מסתיימת לפני הקריאה לשירות ולכן קלט פסול אינו משנה מצב.",
      "מזהי השחקנים וסדר התורים נגזרים מאותו סדר קלט.",
      "מפעל הלוח מחזיר בדיוק 16 משבצות עם מזהה השווה למיקום במסלול.",
      "השירות שומר ומחזיר את אותו משחק, כולל אירוע הפתיחה.",
    ],
    verify: [
      "שלחו POST /api/game עם {\"player_names\":[\"סיגית\",\"אמיר\"]}.",
      "בדקו len(board) == 16, current_player_id == 1 ו־available_actions == [\"roll\"].",
      "שלחו שמות כפולים או שם ריק וודאו שמתקבל 422. הריצו בדיקת תרגיל 2.",
    ],
  },
  {
    file: "03_retrieve_game_state_answer.docx",
    title: "תרגיל 3: שמירת מצב ושליפתו",
    task: "להחזיר ב־GET /api/game את המשחק הפעיל שנשמר, ללא יצירה מחדש וללא שינוי של אף ערך.",
    criteria: [
      "לאחר POST, קריאת GET מחזירה GameState זהה.",
      "קריאות GET חוזרות אינן משנות כסף, תור, מיקום, בעלות או אירועים.",
      "כאשר אין משחק שמור מתקבלת תשובת 404 עם detail.",
      "בקשת יצירה שנדחתה אינה מחליפה משחק תקין שכבר נשמר.",
    ],
    explanation: [
      "המצב חייב לחיות מעבר למשך בקשת HTTP אחת. מאגר בזיכרון מחזיק הפניה למשחק הפעיל כל עוד תהליך השרת פועל.",
      "פעולת GET היא קריאה בלבד: היא מבקשת את המשחק מהמאגר וממירה אותו לחוזה התגובה. אם אין משחק, שכבת התחום מעלה שגיאה ייעודית שמתורגמת ל־404.",
    ],
    code: [
      {
        label: "game_engine/repositories/game_repository.py",
        text: `class GameRepository:
    def __init__(self) -> None:
        self.current_game: Game | None = None

    def save(self, game: Game) -> Game:
        self.current_game = game
        return game

    def get(self) -> Game | None:
        return self.current_game


@lru_cache
def get_game_repository() -> GameRepository:
    return GameRepository()`,
      },
      {
        label: "שירות, שגיאה ונתיב GET",
        text: `class GameNotFoundError(Exception):
    pass


def get_game(self) -> Game:
    game = self.repository.get()
    if game is None:
        raise GameNotFoundError("No active game exists.")
    return game


@router.get("/game", response_model=GameStateResponse)
def get_game(service=Depends(get_game_service)):
    return GameStateResponse.model_validate(service.get_game().to_dict())


@app.exception_handler(GameNotFoundError)
async def game_not_found(request, exc):
    return JSONResponse(status_code=404, content={"detail": str(exc)})`,
      },
    ],
    why: [
      "lru_cache יוצר מאגר יחיד לתהליך במקום מאגר חדש בכל בקשה.",
      "GET אינו קורא save ואינו מפעיל חוק משחק, ולכן הוא אינו משנה מצב.",
      "שגיאת התחום נשארת עצמאית מ־FastAPI ורק שכבת HTTP קובעת את קוד 404.",
    ],
    verify: [
      "בצעו reset או הפעילו שרת חדש; GET /api/game צריך להחזיר 404.",
      "צרו משחק, שמרו את JSON, ובצעו שתי קריאות GET. שלוש התשובות צריכות להיות זהות.",
      "הריצו בדיקת תרגיל 3 מה־UI.",
    ],
  },
  {
    file: "04_roll_movement_and_start_bonus_answer.docx",
    title: "תרגיל 4: קובייה, תנועה ופרס יציאה",
    task: "להוסיף POST /api/game/roll שמגריל 1–6, מזיז את השחקן הנוכחי במסלול מעגלי ומעניק 200 במעבר בנקודת היציאה.",
    criteria: [
      "אפשר לזרוק רק כאשר roll מופיעה ב־available_actions.",
      "המיקום החדש הוא תמיד 0–15 ורק השחקן הנוכחי זז.",
      "מעבר או נחיתה בנקודת היציאה מוסיפים 200.",
      "במצב בדיקות בלבד הכותרת X-Test-Dice-Roll יכולה לקבוע תוצאה 1–6; ערך פסול מחזיר 422 ללא שינוי.",
    ],
    explanation: [
      "תנועה מעגלית מחושבת באמצעות שארית בחלוקה לגודל הלוח. לפני העדכון שומרים את המיקום הישן, וכך אפשר לזהות שהסכום חצה את סוף המסלול.",
      "שירות קובייה נפרד מאפשר משחק אקראי בייצור ובדיקה דטרמיניסטית. הנתיב קורא כותרת בדיקה רק כאשר משתנה הסביבה מפעיל במפורש מצב בדיקות.",
    ],
    code: [
      {
        label: "שירותי הקובייה והתנועה",
        text: `class DiceService:
    def roll(self) -> int:
        return random.randint(1, 6)


class MovementService:
    START_REWARD = 200

    def move_player(self, game: Game, player: Player, steps: int) -> bool:
        old_position = player.position
        board_size = len(game.board)
        player.position = (old_position + steps) % board_size
        passed_start = old_position + steps >= board_size
        if passed_start:
            player.change_money(self.START_REWARD)
        return passed_start`,
      },
      {
        label: "פעולת roll בשירות המשחק",
        text: `def roll(self, forced_roll: int | None = None) -> Game:
    game = self.get_game()
    self._require_action(game, "roll")
    player = game.current_player
    value = forced_roll if forced_roll is not None else self.dice_service.roll()
    passed = self.movement_service.move_player(game, player, value)
    if passed:
        game.add_event(
            f"{player.name} rolled {value}, moved to {player.position}, "
            "and received 200 for Start."
        )
    else:
        game.add_event(f"{player.name} rolled {value} and moved to {player.position}.")
    game.available_actions = ["end_turn"]
    return self.repository.save(game)`,
      },
      {
        label: "נתיב HTTP ותוצאת בדיקה כפויה",
        text: `@router.post("/game/roll", response_model=ActionResponse)
def roll(service=Depends(get_game_service), x_test_dice_roll: str | None = Header(None)):
    forced = None
    if os.getenv("PROPERTY_EMPIRE_TESTING") == "1" and x_test_dice_roll:
        if not x_test_dice_roll.isdigit() or int(x_test_dice_roll) not in range(1, 7):
            raise HTTPException(422, "Test dice roll must be 1 to 6.")
        forced = int(x_test_dice_roll)
    return ActionResponse(state=service.roll(forced_roll=forced).to_dict())`,
      },
    ],
    why: [
      "אופרטור % מונע מיקום מחוץ ללוח.",
      "הכותרת נבדקת לפני שינוי המשחק, ולכן ערך פסול אינו מזיז שחקן.",
      "בדיקת available_actions מונעת שתי זריקות באותו תור.",
    ],
    verify: [
      "הפעילו PROPERTY_EMPIRE_TESTING=1 ושלחו X-Test-Dice-Roll: 3.",
      "הציבו שחקן במיקום 14 ובדקו שתוצאה 3 מעבירה למיקום 1 ומוסיפה 200.",
      "הריצו בדיקת תרגיל 4.",
    ],
  },
  {
    file: "05_tile_effects_answer.docx",
    title: "תרגיל 5: השפעות משבצות",
    task: "להרחיב את פעולת הזריקה כך שלאחר התנועה השרת יפתור את השפעת המשבצת: פרס, תשלום, הפתעה או נכס פנוי.",
    criteria: [
      "reward מוסיפה amount ו־penalty מפחיתה amount.",
      "surprise בוחרת אפקט חוקי ומעדכנת כסף או מיקום.",
      "נכס פנוי אינו נקנה אוטומטית אלא מפרסם buy ו־end_turn.",
      "כל תוצאה מעדכנת last_event ואת סוף event_log.",
    ],
    explanation: [
      "אחרי ששירות התנועה מסיים, שירות משבצות מקבל את המשחק והשחקן ומחליט מה משתנה לפי סוג המשבצת. כך פעולת roll מתאמת בין שירותים ואינה מכילה את כל החוקים בעצמה.",
      "נכס פנוי רק מאפשר פעולה עתידית. לעומת זאת פרס, תשלום והפתעה מסתיימים מיד ולכן הפעולה הבאה היחידה היא end_turn.",
    ],
    code: [
      {
        label: "game_engine/services/tile_service.py",
        text: `def resolve_landing(self, game: Game, player: Player) -> None:
    tile = game.board[player.position]

    if isinstance(tile, PropertyTile):
        if tile.owner_id is None:
            game.available_actions = ["buy", "end_turn"]
            game.add_event(f"{player.name} landed on unowned {tile.name}.")
        else:
            game.available_actions = ["end_turn"]
        return

    if isinstance(tile, RewardTile):
        player.change_money(tile.amount)
        game.add_event(f"{player.name} received {tile.amount} from {tile.name}.")
    elif isinstance(tile, PenaltyTile):
        player.change_money(-tile.amount)
        game.add_event(f"{player.name} paid {tile.amount} for {tile.name}.")
    elif isinstance(tile, SurpriseTile):
        effect = random.choice(["gain_100", "lose_50", "forward_2"])
        if effect == "gain_100":
            player.change_money(100)
            game.add_event(f"Surprise: {player.name} received 100.")
        elif effect == "lose_50":
            player.change_money(-50)
            game.add_event(f"Surprise: {player.name} paid 50.")
        else:
            player.position = (player.position + 2) % len(game.board)
            game.add_event(f"Surprise: {player.name} moved forward 2.")
    else:
        game.add_event(f"{player.name} landed on {tile.name}.")

    game.available_actions = ["end_turn"]`,
      },
      {
        label: "חיבור לפעולת roll",
        text: `passed_start = self.movement_service.move_player(game, player, roll_value)
# Add the movement event first.
self.tile_service.resolve_landing(game, player)
self._finish_if_needed(game)
return self.repository.save(game)`,
      },
    ],
    why: [
      "המשבצת נפתרת רק אחרי שהמיקום החדש נשמר.",
      "כל ענף קובע במפורש את הפעולות הזמינות למצב החדש.",
      "add_event מעדכן יחד את last_event ואת event_log ושומר על עקביות.",
    ],
    verify: [
      "כפו תוצאות קובייה שמגיעות למשבצות reward, penalty ו־surprise ובדקו את ההפרש בכסף.",
      "נחתו על נכס פנוי וודאו שהבעלות והכסף לא השתנו וש־buy זמינה.",
      "הריצו בדיקת תרגיל 5.",
    ],
  },
  {
    file: "06_buy_property_answer.docx",
    title: "תרגיל 6: רכישת נכס",
    task: "להוסיף POST /api/game/buy שרוכש נכס פנוי כאשר הפעולה מותרת ומעדכן כסף ושתי תצוגות בעלות באותה פעולה.",
    criteria: [
      "הרכישה אפשרית רק כאשר buy מופיעה ב־available_actions.",
      "מחיר הנכס מופחת מכסף השחקן, owner_id מתעדכן ומזהה הנכס נוסף ל־owned_tile_ids.",
      "לאחר הרכישה רק end_turn זמינה ונוסף אירוע קנייה.",
      "נכס תפוס, משבצת אחרת, חוסר כסף או זמן לא מתאים מחזירים 409 ללא שינוי חלקי.",
    ],
    explanation: [
      "לפני כל שינוי בודקים את כל התנאים. רק לאחר שכל הבדיקות עברו מבצעים את שלושת העדכונים יחד, כך לא נשאר מצב שבו הכסף ירד אך הבעלות לא נרשמה.",
      "הבעלות מופיעה גם על הנכס וגם ברשימת השחקן משום שה־UI צריך להציג את הלוח ואת תיק הנכסים. שני המקומות חייבים להסכים.",
    ],
    code: [
      {
        label: "GameService.buy",
        text: `def buy(self) -> Game:
    game = self.get_game()
    self._require_action(game, "buy")
    player = self._current_player(game)
    tile = game.board[player.position]

    if not isinstance(tile, PropertyTile) or tile.owner_id is not None:
        raise InvalidActionError("There is no unowned property to buy.")
    if player.money < tile.price:
        raise InvalidActionError("Player does not have enough money.")

    player.change_money(-tile.price)
    tile.owner_id = player.id
    player.owned_tile_ids.append(tile.id)
    game.available_actions = ["end_turn"]
    game.add_event(f"{player.name} bought {tile.name} for {tile.price}.")
    return self.repository.save(game)`,
      },
      {
        label: "נתיב הקנייה",
        text: `@router.post("/game/buy", response_model=ActionResponse)
def buy(service: GameService = Depends(get_game_service)) -> ActionResponse:
    state = GameStateResponse.model_validate(service.buy().to_dict())
    return ActionResponse(state=state)`,
      },
    ],
    why: [
      "כל השגיאות נזרקות לפני השורה הראשונה שמשנה כסף או בעלות.",
      "העדכון נשמר רק לאחר השלמת כל השינויים.",
      "התגובה עטופה ב־state כמו שאר פעולות המשחק.",
    ],
    verify: [
      "כפו זריקה 1, קנו את ירדן ובדקו: money=1400, owner_id=1 ו־owned_tile_ids=[1].",
      "שלחו buy פעם נוספת ובדקו 409 ושמצב המשחק זהה למצב שלפני הבקשה.",
      "הריצו בדיקת תרגיל 6.",
    ],
  },
  {
    file: "07_turns_and_rent_answer.docx",
    title: "תרגיל 7: תורות ושכירות",
    task: "להוסיף סיום תור מעגלי ולחייב שכירות כאשר שחקן נוחת על נכס של שחקן אחר.",
    criteria: [
      "POST /api/game/end-turn עובר לשחקן הפעיל הבא ומחזיר available_actions=[roll].",
      "אי אפשר לסיים תור לפני זריקה; פעולה אסורה מחזירה 409 ללא שינוי.",
      "שכירות יורדת מהשוכר ומתווספת לבעלים באותו סכום.",
      "נכס עצמי אינו משנה כסף ושחקן שפשט רגל אינו מקבל תור.",
    ],
    explanation: [
      "שירות התורות מחפש את השחקן הפעיל הבא בצורה מעגלית. הוא מדלג על פושטי רגל וקובע את הפעולה הראשונה של התור החדש.",
      "השכירות היא חלק מפתרון משבצת property. לפני התשלום מאתרים את הבעלים לפי owner_id; לאחר מכן מחייבים ומזכים באותה פעולה ומוסיפים אירוע אחד המתאר את ההעברה.",
    ],
    code: [
      {
        label: "TurnService.advance_turn",
        text: `def advance_turn(self, game: Game) -> None:
    player_count = len(game.players)
    for offset in range(1, player_count + 1):
        next_index = (game.current_player_index + offset) % player_count
        if not game.players[next_index].is_bankrupt:
            game.current_player_index = next_index
            game.available_actions = ["roll"]
            game.add_event(f"It is now {game.players[next_index].name}'s turn.")
            return


def end_turn(self) -> Game:
    game = self.get_game()
    self._require_action(game, "end_turn")
    self.turn_service.advance_turn(game)
    return self.repository.save(game)`,
      },
      {
        label: "פתרון נכס תפוס ב־TileService",
        text: `if tile.owner_id == player.id:
    game.available_actions = ["end_turn"]
    game.add_event(f"{player.name} landed on their own {tile.name}.")
    return

owner = next(other for other in game.players if other.id == tile.owner_id)
player.change_money(-tile.rent)
owner.change_money(tile.rent)
game.available_actions = ["end_turn"]
game.add_event(
    f"{player.name} paid {tile.rent} rent to {owner.name} for {tile.name}."
)`,
      },
      {
        label: "אכיפת פעולות זמינות",
        text: `def _require_action(self, game: Game, action: str) -> None:
    if game.status == "finished":
        raise InvalidActionError("The game is finished.")
    if action not in game.available_actions:
        raise InvalidActionError(f"Action '{action}' is not available now.")`,
      },
    ],
    why: [
      "חיפוש עם modulo מחזיר את התור לראש הרשימה לאחר השחקן האחרון.",
      "בדיקת is_bankrupt מונעת הקצאת תור לשחקן שאינו פעיל.",
      "החיוב והזיכוי משתמשים באותו rent ולכן סכום הכסף הכולל נשמר.",
    ],
    verify: [
      "נסו end-turn מיד לאחר יצירה וצפו ל־409 ללא שינוי.",
      "לאחר roll בצעו end-turn ובדקו שהשחקן הבא מקבל current_player_id ו־roll.",
      "צרו בעלות, הנחיתו שחקן אחר על הנכס והשוו את הירידה והעלייה בכסף. הריצו תרגיל 7.",
    ],
  },
  {
    file: "08_complete_game_answer.docx",
    title: "תרגיל 8: מחזור חיים ומשחק מלא",
    task: "להשלים פשיטת רגל, הכרזת מנצח ואיפוס, ולוודא שכל שמונת השלבים עובדים יחד דרך HTTP בלבד.",
    criteria: [
      "כסף שלילי מסמן is_bankrupt=true ושחקן כזה אינו מקבל תורות.",
      "כאשר נשאר שחקן פעיל אחד, status=finished, winner_id נקבע ו־available_actions ריקה.",
      "פעולות משחק לאחר סיום מחזירות 409 ואינן משנות את מצב הסיום.",
      "POST /api/game/reset מחזיר state במצב not_started עם שחקנים, לוח ופעולות ריקים.",
      "כל נקודות הקצה נשארות תואמות ל־UI והשרת הוא מקור האמת היחיד.",
    ],
    explanation: [
      "שינוי כסף הוא המקום היחיד שמחליט על פשיטת רגל, ולכן כל קנס, שכירות והפתעה מקבלים אותה התנהגות. לאחר פעולה שעשויה לשנות כסף, שירות המשחק מבקש משירות התורות לבדוק אם נותר שחקן יחיד.",
      "מצב finished הוא מצב סופי: אין שחקן נוכחי ואין פעולות זמינות. reset אינו ממשיך את אותו משחק אלא מוחק את המאגר ומחזיר צילום מצב ריק ועקבי.",
      "הממשק רק קורא GameState ושולח פעולות שפורסמו ב־available_actions. כל חישוב של כסף, תנועה, בעלות, תור וניצחון נשאר בשרת.",
    ],
    code: [
      {
        label: "פשיטת רגל ובדיקת מנצח",
        text: `def change_money(self, amount: int) -> None:
    self.money += amount
    if self.money < 0:
        self.is_bankrupt = True


def update_winner(self, game: Game) -> None:
    active = [player for player in game.players if not player.is_bankrupt]
    if len(active) == 1:
        game.status = "finished"
        game.winner_id = active[0].id
        game.available_actions = []
        game.add_event(f"{active[0].name} wins the game.")`,
      },
      {
        label: "איפוס המשחק",
        text: `def reset(self) -> Game:
    self.repository.reset()
    game = Game(
        players=[],
        board=[],
        status="not_started",
        available_actions=[],
    )
    game.add_event("Game reset.")
    return game


@router.post("/game/reset", response_model=ActionResponse)
def reset(service=Depends(get_game_service)):
    return ActionResponse(state=service.reset().to_dict())`,
      },
      {
        label: "תרגום שגיאות תחום לתשובות HTTP",
        text: `class GameError(Exception):
    status_code = 400

    def __init__(self, message: str) -> None:
        self.message = message


class GameNotFoundError(GameError):
    status_code = 404


class InvalidActionError(GameError):
    status_code = 409


@app.exception_handler(GameError)
async def handle_game_error(request: Request, exc: GameError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )`,
      },
      {
        label: "חיבור היישום לממשק הנפרד",
        text: `app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(game_router, prefix="/api")`,
      },
    ],
    why: [
      "כל שינוי כסף עובר דרך change_money ולכן אי אפשר לשכוח לעדכן פשיטת רגל.",
      "update_winner מרכז את מעבר מצב המשחק ומרוקן את הפעולות הזמינות.",
      "reset מחזיר תמיד אותו חוזה ActionResponse כמו שאר הפעולות.",
      "טיפול שגיאות מרכזי מבטיח JSON עם detail וקוד HTTP עקבי.",
    ],
    verify: [
      "הריצו תרחיש שבו שחקן יורד מתחת ל־0 ובדקו שהוא מדולג בתור.",
      "כאשר נותר שחקן אחד, ודאו finished, winner_id ורשימת פעולות ריקה; נסו פעולה וצפו ל־409.",
      "שלחו reset ובדקו not_started ורשימות ריקות. הריצו checkpoint 8 במצב cumulative מה־UI.",
    ],
  },
];

function rtlRun(text, options = {}) {
  return new TextRun({
    text,
    font: "Arial",
    rightToLeft: true,
    language: { bidirectional: "he-IL" },
    color: "17233C",
    ...options,
  });
}

function rtlParagraph(text, options = {}) {
  return new Paragraph({
    bidirectional: true,
    alignment: options.alignment || AlignmentType.RIGHT,
    spacing: options.spacing || { after: 140, line: 320 },
    heading: options.heading,
    children: [rtlRun(text, options.run || {})],
  });
}

function heading(text, level) {
  return rtlParagraph(text, {
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 260 : 180, after: 120 },
    run: { bold: true, color: level === HeadingLevel.HEADING_1 ? "13315C" : "1B6B69" },
  });
}

function bulletList(items, reference) {
  return items.map((item) => new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    numbering: { reference, level: 0 },
    spacing: { after: 90, line: 300 },
    children: [rtlRun(item)],
  }));
}

function codeTable(block) {
  const lines = block.text.split("\n");
  const codeParagraphs = lines.map((line) => new Paragraph({
    alignment: AlignmentType.LEFT,
    bidirectional: false,
    spacing: { after: 0, line: 240 },
    children: [new TextRun({ text: line || " ", font: "Consolas", size: 17, color: "E8EEF7" })],
  }));
  return [
    rtlParagraph(block.label, { spacing: { before: 100, after: 55 }, run: { bold: true, size: 20, color: "345995" } }),
    new Table({
      width: { size: contentWidth, type: WidthType.DXA },
      columnWidths: [contentWidth],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: contentWidth, type: WidthType.DXA },
        shading: { fill: "101827", type: ShadingType.CLEAR },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "29415F" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "29415F" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "29415F" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "29415F" },
        },
        margins: { top: 140, bottom: 140, left: 180, right: 180 },
        children: codeParagraphs,
      })] })],
    }),
  ];
}

function createDocument(answer, index) {
  const children = [
    rtlParagraph(`פתרון מוצע • Sigit Empire • תרגיל ${index + 1} מתוך 8`, {
      spacing: { after: 80 },
      run: { bold: true, size: 19, color: "B7791F" },
    }),
    rtlParagraph(answer.title, {
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
      run: { bold: true, size: 42, color: "13315C" },
    }),
    rtlParagraph("מסמך זה מציג דרך אחת נכונה לפתרון. אפשר לבחור מבנה קוד אחר כל עוד חוזה ה־HTTP וההתנהגות זהים.", {
      spacing: { after: 220 },
      run: { italics: true, color: "52647A" },
    }),
    heading("התרגיל", HeadingLevel.HEADING_1),
    rtlParagraph(answer.task, { run: { bold: true } }),
    heading("תנאי קבלה", HeadingLevel.HEADING_2),
    ...bulletList(answer.criteria, `criteria-${index}`),
    heading("התשובה במילים", HeadingLevel.HEADING_1),
    ...answer.explanation.map((text) => rtlParagraph(text)),
    heading("התשובה בקוד", HeadingLevel.HEADING_1),
    ...answer.code.flatMap(codeTable),
    heading("למה הפתרון עובד", HeadingLevel.HEADING_1),
    ...bulletList(answer.why, `why-${index}`),
    heading("איך לבדוק", HeadingLevel.HEADING_1),
    ...bulletList(answer.verify, `verify-${index}`),
    rtlParagraph("הפתרון המלא והניתן להרצה נמצא בתיקייה instructor/solution-api. מומלץ להשוות אליו רק לאחר ניסיון עצמאי והרצת ה־checkpoint המתאים.", {
      spacing: { before: 260, after: 0 },
      run: { bold: true, color: "8A4B08" },
    }),
  ];

  return new Document({
    creator: "Sigit Empire Classroom",
    title: `${answer.title} — פתרון`,
    description: "Hebrew instructor answer guide with explanation and code.",
    styles: {
      default: { document: { run: { font: "Arial", size: 22, color: "17233C" } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: "Arial", size: 42, bold: true }, paragraph: { outlineLevel: 0 } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: "Arial", size: 30, bold: true }, paragraph: { outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: "Arial", size: 25, bold: true }, paragraph: { outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: ["criteria", "why", "verify"].map((kind) => ({
        reference: `${kind}-${index}`,
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.RIGHT,
          style: { paragraph: { indent: { right: 540, hanging: 260 } } },
        }],
      })),
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1050, right: 1440, bottom: 1050, left: 1440 },
        },
      },
      headers: {
        default: new Header({ children: [rtlParagraph("Sigit Empire | תשובות לתרגילי Backend", {
          spacing: { after: 60 },
          run: { size: 17, color: "64748B" },
        })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [rtlRun("עמוד ", { size: 17, color: "64748B" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 17, color: "64748B" })],
        })] }),
      },
      children,
    }],
  });
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  for (let index = 0; index < answers.length; index += 1) {
    const answer = answers[index];
    const buffer = await Packer.toBuffer(createDocument(answer, index));
    fs.writeFileSync(path.join(output, answer.file), buffer);
    process.stdout.write(`Created ${answer.file}\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
