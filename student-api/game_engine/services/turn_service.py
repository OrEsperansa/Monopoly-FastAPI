from game_engine.models.game import Game


class TurnService:
    """Owns turn rotation and winner detection."""

    def active_players(self, game: Game) -> list[int]:
        return [index for index, player in enumerate(game.players) if not player.is_bankrupt]

    def update_winner(self, game: Game) -> None:
        active = [player for player in game.players if not player.is_bankrupt]
        if len(active) == 1:
            game.status = "finished"
            game.winner_id = active[0].id
            game.available_actions = []
            game.add_event(f"{active[0].name} wins the game.")

    def advance_turn(self, game: Game) -> None:
        self.update_winner(game)
        if game.status == "finished":
            return

        player_count = len(game.players)
        for offset in range(1, player_count + 1):
            next_index = (game.current_player_index + offset) % player_count
            if not game.players[next_index].is_bankrupt:
                game.current_player_index = next_index
                game.available_actions = ["roll"]
                game.add_event(f"It is now {game.players[next_index].name}'s turn.")
                return
