from game_engine.models.game import Game
from game_engine.models.player import Player


class MovementService:
    """Moves players and detects Start rewards."""

    START_REWARD = 200

    def move_player(self, game: Game, player: Player, steps: int) -> bool:
        old_position = player.position
        board_size = len(game.board)
        player.position = (player.position + steps) % board_size

        passed_or_landed_start = steps > 0 and old_position + steps >= board_size
        landed_on_start = player.position == 0
        if passed_or_landed_start or landed_on_start:
            player.change_money(self.START_REWARD)
            return True
        return False
