import random
from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import cast

from schemas import (
    BoardTileState,
    GameState,
    PenaltyTileState,
    PlayerState,
    PropertyTileState,
    RewardTileState,
)
from tiles import TileType


EventLogger = Callable[[str], None]


class TileActivationStrategy(ABC):
    """Strategy interface for resolving a tile landing."""

    @abstractmethod
    def activate(
        self,
        game: GameState,
        player: PlayerState,
        tile: BoardTileState,
        add_event: EventLogger,
    ) -> None:
        pass


class StartTileActivationStrategy(TileActivationStrategy):
    def activate(
        self,
        game: GameState,
        player: PlayerState,
        tile: BoardTileState,
        add_event: EventLogger,
    ) -> None:
        game.available_actions = ["end_turn"]
        add_event(f"{player.name} landed on {tile.name}.")


class PropertyTileActivationStrategy(TileActivationStrategy):
    def activate(
        self,
        game: GameState,
        player: PlayerState,
        tile: BoardTileState,
        add_event: EventLogger,
    ) -> None:
        property_tile = cast(PropertyTileState, tile)

        if property_tile.owner_id is None:
            game.available_actions = ["buy", "end_turn"]
            add_event(f"{player.name} landed on unowned {property_tile.name}.")
            return

        game.available_actions = ["end_turn"]
        if property_tile.owner_id == player.id:
            add_event(f"{player.name} landed on their own {property_tile.name}.")
            return

        owner = next(
            other for other in game.players
            if other.id == property_tile.owner_id
        )
        player.money -= property_tile.rent
        owner.money += property_tile.rent
        add_event(
            f"{player.name} paid {property_tile.rent} rent to "
            f"{owner.name} for {property_tile.name}."
        )


class RewardTileActivationStrategy(TileActivationStrategy):
    def activate(
        self,
        game: GameState,
        player: PlayerState,
        tile: BoardTileState,
        add_event: EventLogger,
    ) -> None:
        reward_tile = cast(RewardTileState, tile)
        player.money += reward_tile.amount
        game.available_actions = ["end_turn"]
        add_event(f"{player.name} received {reward_tile.amount} from {reward_tile.name}.")


class PenaltyTileActivationStrategy(TileActivationStrategy):
    def activate(
        self,
        game: GameState,
        player: PlayerState,
        tile: BoardTileState,
        add_event: EventLogger,
    ) -> None:
        penalty_tile = cast(PenaltyTileState, tile)
        player.money -= penalty_tile.amount
        game.available_actions = ["end_turn"]
        add_event(f"{player.name} paid {penalty_tile.amount} for {penalty_tile.name}.")


class SurpriseTileActivationStrategy(TileActivationStrategy):
    def activate(
        self,
        game: GameState,
        player: PlayerState,
        tile: BoardTileState,
        add_event: EventLogger,
    ) -> None:
        effect = random.choice([
            "gain_100",
            "lose_50",
            "collect_50",
            "pay_25",
            "forward_2",
            "backward_2",
        ])

        if effect == "gain_100":
            player.money += 100
            event = f"Surprise: {player.name} received 100."
        elif effect == "lose_50":
            player.money -= 50
            event = f"Surprise: {player.name} paid 50."
        elif effect == "collect_50":
            for other in game.players:
                if other.id != player.id and not other.is_bankrupt:
                    other.money -= 50
                    player.money += 50
            event = f"Surprise: {player.name} received 50 from every player."
        elif effect == "pay_25":
            for other in game.players:
                if other.id != player.id and not other.is_bankrupt:
                    player.money -= 25
                    other.money += 25
            event = f"Surprise: {player.name} paid 25 to every player."
        elif effect == "forward_2":
            player.position = (player.position + 2) % len(game.board)
            event = f"Surprise: {player.name} moved forward 2."
        else:
            player.position = (player.position - 2) % len(game.board)
            event = f"Surprise: {player.name} moved backward 2."

        game.available_actions = ["end_turn"]
        add_event(event)


def create_tile_activation_strategies() -> dict[TileType, TileActivationStrategy]:
    return {
        TileType.START: StartTileActivationStrategy(),
        TileType.PROPERTY: PropertyTileActivationStrategy(),
        TileType.REWARD: RewardTileActivationStrategy(),
        TileType.PENALTY: PenaltyTileActivationStrategy(),
        TileType.SURPRISE: SurpriseTileActivationStrategy(),
    }
