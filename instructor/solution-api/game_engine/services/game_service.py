from game_engine.exceptions import GameNotFoundError, InvalidActionError
from game_engine.factories.board_factory import BoardFactory
from game_engine.models.game import Game
from game_engine.models.player import Player
from game_engine.models.tile import PropertyTile
from game_engine.repositories.game_repository import GameRepository
from game_engine.services.dice_service import DiceService
from game_engine.services.movement_service import MovementService
from game_engine.services.tile_service import TileService
from game_engine.services.turn_service import TurnService


class GameService:
    """Application service that orchestrates game use cases.

    SOLID teaching note: this class coordinates smaller services instead of
    doing every job itself. Dice, movement, tile effects, turns, and storage
    each have one clear responsibility.
    """

    def __init__(
        self,
        repository: GameRepository,
        dice_service: DiceService,
        movement_service: MovementService,
        tile_service: TileService,
        turn_service: TurnService,
    ) -> None:
        self.repository = repository
        self.dice_service = dice_service
        self.movement_service = movement_service
        self.tile_service = tile_service
        self.turn_service = turn_service
        self.board_factory = BoardFactory()

    def create_game(self, player_names: list[str]) -> Game:
        players = [Player(id=index + 1, name=name) for index, name in enumerate(player_names)]
        game = Game(players=players, board=self.board_factory.create_board())
        game.add_event("Game created. Roll to begin.")
        return self.repository.save(game)

    def get_game(self) -> Game:
        game = self.repository.get()
        if game is None:
            raise GameNotFoundError("No active game exists.")
        return game

    def roll(self, *, forced_roll: int | None = None) -> Game:
        game = self.get_game()
        self._require_action(game, "roll")
        player = self._current_player(game)

        roll_value = forced_roll if forced_roll is not None else self.dice_service.roll()
        passed_start = self.movement_service.move_player(game, player, roll_value)
        if passed_start:
            game.add_event(f"{player.name} rolled {roll_value}, moved to {player.position}, and received 200 for Start.")
        else:
            game.add_event(f"{player.name} rolled {roll_value} and moved to {player.position}.")

        self.tile_service.resolve_landing(game, player)
        self._finish_if_needed(game)
        return self.repository.save(game)

    def buy(self) -> Game:
        game = self.get_game()
        self._require_action(game, "buy")
        player = self._current_player(game)
        tile = game.board[player.position]

        if not isinstance(tile, PropertyTile) or tile.owner_id is not None:
            raise InvalidActionError("There is no unowned property to buy.")
        if player.money < tile.price:
            raise InvalidActionError("Player does not have enough money to buy this property.")

        player.change_money(-tile.price)
        tile.owner_id = player.id
        player.owned_tile_ids.append(tile.id)
        game.available_actions = ["end_turn"]
        game.add_event(f"{player.name} bought {tile.name} for {tile.price}.")
        self._finish_if_needed(game)
        return self.repository.save(game)

    def end_turn(self) -> Game:
        game = self.get_game()
        self._require_action(game, "end_turn")
        self.turn_service.advance_turn(game)
        return self.repository.save(game)

    def reset(self) -> Game:
        self.repository.reset()
        game = Game(players=[], board=[], status="not_started", available_actions=[])
        game.add_event("Game reset.")
        return game

    def _current_player(self, game: Game) -> Player:
        player = game.current_player
        if player is None:
            raise InvalidActionError("The game is finished.")
        if player.is_bankrupt:
            raise InvalidActionError("The current player is bankrupt.")
        return player

    def _require_action(self, game: Game, action: str) -> None:
        if game.status == "finished":
            raise InvalidActionError("The game is finished.")
        if action not in game.available_actions:
            raise InvalidActionError(f"Action '{action}' is not available now.")

    def _finish_if_needed(self, game: Game) -> None:
        self.turn_service.update_winner(game)
