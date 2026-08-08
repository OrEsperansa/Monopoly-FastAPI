import random

from schemas import ActionResponse, GameState, PlayerState
from strategies import TileActivationStrategy, create_tile_activation_strategies
from tiles import create_board, TileType


class GameError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class UnavailableActionError(GameError):
    def __init__(self, action: str):
        super().__init__(f"The action '{action}' is not available at this time.")


class GameManager:
    BOARD_SIZE = 16

    def __init__(
        self,
        tile_strategies: dict[TileType, TileActivationStrategy] | None = None,
    ) -> None:
        self._active_game: GameState | None = None
        self._tile_strategies = (
            create_tile_activation_strategies()
            if tile_strategies is None
            else tile_strategies
        )

    def create_game(self, player_names: list[str]) -> GameState:
        if len(player_names) < 2:
            raise GameError("At least two players are required to start a game.")
        if len(player_names) > 4:
            raise GameError("A maximum of four players are allowed.")

        cleaned = [n.strip() for n in player_names]
        for name in cleaned:
            if not name:
                raise GameError("Empty name is not allowed.")

        lower = [n.lower() for n in cleaned]
        if len(lower) != len(set(lower)):
            raise GameError("Duplicate player names are not allowed.")

        players = [
            PlayerState(id=index + 1, name=name)
            for index, name in enumerate(cleaned)
        ]

        board = [tile.to_dict() for tile in create_board()]

        initial_event = "Game created. Roll to begin."
        game_state = GameState(
            status="active",
            current_player_id=players[0].id,
            winner_id=None,
            available_actions=["roll"],
            players=players,
            board=board,
            last_event=initial_event,
            event_log=[initial_event],
        )

        self._active_game = game_state
        return game_state

    def get_game(self) -> GameState:
        if self._active_game is None:
            raise GameError("No active game found.")
        return self._active_game

    def get_player_by_id(self, player_id: int) -> PlayerState:
        game = self.get_game()
        player = next((p for p in game.players if p.id == player_id), None)
        if player is None:
            raise GameError(f"No player found with ID {player_id}.")
        return player


    def get_current_player(self) -> PlayerState:
        game = self.get_game()
        return self.get_player_by_id(game.current_player_id)

    def get_next_non_bankrupt_player(self) -> PlayerState | None:
        game = self.get_game()
        current_index = next(
            index
            for index, player in enumerate(game.players)
            if player.id == game.current_player_id
        )

        for offset in range(1, len(game.players)):
            candidate_index = (current_index + offset) % len(game.players)
            candidate = game.players[candidate_index]
            if not candidate.is_bankrupt:
                return candidate

        return None

    def _activate_tile(self) -> None:
        game = self.get_game()
        current_player = self.get_current_player()
        current_tile = game.board[current_player.position]
        tile_type = TileType(current_tile.type)
        strategy = self._tile_strategies[tile_type]
        strategy.activate(game, current_player, current_tile, self.event_log)

    def event_log(self, event: str) -> None:
        game = self.get_game()
        game.last_event = event
        game.event_log.append(event)


    def _calculate_new_position(self, current_position: int, roll: int) -> tuple[int, bool]:
        new_position = (current_position + roll) % self.BOARD_SIZE
        passed_start = (current_position + roll) >= self.BOARD_SIZE
        return new_position, passed_start


    def roll_dice(self) -> ActionResponse:
        game = self.get_game()
        if "roll" not in game.available_actions:
            raise UnavailableActionError("roll")
        # Simulate dice roll
        dice1 = random.randint(1, 6)

        current_player = self.get_current_player()
        old_position = current_player.position
        new_position, passed_start = self._calculate_new_position(old_position, dice1)

        current_player.position = new_position
        
        log = f"{current_player.name} rolled {dice1} and moved to {new_position}."
        game.available_actions = ["end_turn"]
        

        if passed_start:
            current_player.money += 200
            log += f" {current_player.name} received 200 for Start."

        self.event_log(log)
        self._activate_tile()

        return ActionResponse(state=game)


    def end_turn(self) -> ActionResponse:
        game = self.get_game()
        if "end_turn" not in game.available_actions:
            raise UnavailableActionError("end_turn")

        next_player = self.get_next_non_bankrupt_player()
        if next_player is None:
            raise GameError("No next non-bankrupt player is available.")

        game.current_player_id = next_player.id

        # Update available actions for the next player
        game.available_actions = ["roll"]
        self.event_log(f"WOLF: {next_player.name} is turn now.")

        return ActionResponse(state=game)

    def buy_property(self) -> ActionResponse:
        game = self.get_game()
        current_player = self.get_current_player()
        current_tile = game.board[current_player.position]

        if "buy" not in game.available_actions:
            raise UnavailableActionError("buy")

        if current_tile.owner_id is not None:
            raise GameError("This property is already owned. BUG: buy option was available when tile was owned?")

        if current_player.money < current_tile.price:
            raise GameError("Insufficient funds to buy this property.")

        # Deduct the price and assign ownership
        current_player.remove_balance(current_tile.price)
        current_tile.owner_id = current_player.id
        current_player.owned_tile_ids.append(current_tile.id)

        self.event_log(f"{current_player.name} bought {current_tile.name} for {current_tile.price}.")
        
        # After buying, the player can end their turn
        game.available_actions = ["end_turn"]

        return ActionResponse(state=game)

    def reset_game(self) -> ActionResponse:
        reset_event = "Game reset."
        reset_state = GameState(
            status="not_started",
            current_player_id=None,
            winner_id=None,
            available_actions=[],
            players=[],
            board=[],
            last_event=reset_event,
            event_log=[reset_event],
        )
        self._active_game = None
        return ActionResponse(state=reset_state)
