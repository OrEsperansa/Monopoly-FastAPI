import random


class DiceService:
    """Small service so tests can monkeypatch dice rolls deterministically."""

    def roll(self) -> int:
        return random.randint(1, 6)
