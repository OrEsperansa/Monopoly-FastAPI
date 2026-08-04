import argparse
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Run cumulative Sigit Empire API checkpoints.")
    parser.add_argument("checkpoint", type=int, choices=range(1, 9))
    parser.add_argument("--api-url", default="http://localhost:8000")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    selected = [str(root / f"exercise_{number:02d}") for number in range(1, args.checkpoint + 1)]
    command = [
        sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider",
        *selected, "--api-url", args.api_url,
    ]
    return subprocess.call(command, cwd=root.parent)


if __name__ == "__main__":
    raise SystemExit(main())
