import random

from game_engine.models.game import Game
from game_engine.models.player import Player
from game_engine.models.tile import PenaltyTile, PropertyTile, RewardTile, SurpriseTile


class TileService:
    """Resolves what happens after a player lands on a tile.

    Polymorphism note for students: callers handle a Tile through its base type,
    while this service branches only where rules truly differ by concrete tile.
    """

    def resolve_landing(self, game: Game, player: Player, *, allow_surprise_movement: bool = True) -> None:
        tile = game.board[player.position]

        if isinstance(tile, PropertyTile):
            self._resolve_property(game, player, tile)
        elif isinstance(tile, RewardTile):
            player.change_money(tile.amount)
            game.available_actions = ["end_turn"]
            game.add_event(f"{player.name} received {tile.amount} from {tile.name}.")
        elif isinstance(tile, PenaltyTile):
            player.change_money(-tile.amount)
            game.available_actions = ["end_turn"]
            game.add_event(f"{player.name} paid {tile.amount} for {tile.name}.")
        elif isinstance(tile, SurpriseTile):
            self._resolve_surprise(game, player, allow_surprise_movement=allow_surprise_movement)
        else:
            game.available_actions = ["end_turn"]
            game.add_event(f"{player.name} landed on {tile.name}.")

    def _resolve_property(self, game: Game, player: Player, tile: PropertyTile) -> None:
        if tile.owner_id is None:
            game.available_actions = ["buy", "end_turn"]
            game.add_event(f"{player.name} landed on unowned {tile.name}.")
            return

        if tile.owner_id == player.id:
            game.available_actions = ["end_turn"]
            game.add_event(f"{player.name} landed on their own {tile.name}.")
            return

        owner = next(other for other in game.players if other.id == tile.owner_id)
        player.change_money(-tile.rent)
        owner.change_money(tile.rent)
        game.available_actions = ["end_turn"]
        game.add_event(f"{player.name} paid {tile.rent} rent to {owner.name} for {tile.name}.")

    def _resolve_surprise(self, game: Game, player: Player, *, allow_surprise_movement: bool) -> None:
        effects = ["gain_100", "lose_50", "collect_50", "pay_25"]
        if allow_surprise_movement:
            effects.extend(["forward_2", "backward_2"])

        effect = random.choice(effects)

        if effect == "gain_100":
            player.change_money(100)
            game.add_event(f"Surprise: {player.name} received 100.")
        elif effect == "lose_50":
            player.change_money(-50)
            game.add_event(f"Surprise: {player.name} paid 50.")
        elif effect == "collect_50":
            for other in game.players:
                if other.id != player.id and not other.is_bankrupt:
                    other.change_money(-50)
                    player.change_money(50)
            game.add_event(f"Surprise: {player.name} received 50 from every player.")
        elif effect == "pay_25":
            for other in game.players:
                if other.id != player.id and not other.is_bankrupt:
                    player.change_money(-25)
                    other.change_money(25)
            game.add_event(f"Surprise: {player.name} paid 25 to every player.")
        elif effect == "forward_2":
            player.position = (player.position + 2) % len(game.board)
            game.add_event(f"Surprise: {player.name} moved forward 2.")
            self.resolve_landing(game, player, allow_surprise_movement=False)
            return
        elif effect == "backward_2":
            player.position = (player.position - 2) % len(game.board)
            game.add_event(f"Surprise: {player.name} moved backward 2.")
            self.resolve_landing(game, player, allow_surprise_movement=False)
            return

        game.available_actions = ["end_turn"]
