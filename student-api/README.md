# Student Backend Starter

This directory intentionally contains dependencies only. Build the backend described in the Hebrew exercise READMEs without copying a prescribed project structure.

## Start here

1. Create and activate a Python virtual environment.
2. Run \`pip install -r requirements.txt\`.
3. Read \`student-tests/exercise_01/README.md\`.
4. Create an ASGI application and run it with \`uvicorn <your_module>:app --reload --port <available-port>\`.
5. Point the shared UI at that API URL.
6. Run \`python student-tests/run_checkpoint.py 1 --api-url http://localhost:<port>\` from the repository root.

Continue through the README files in `student-tests/exercise_01/` through `exercise_09/`. The tests observe only HTTP requests and responses; they do not require a particular file layout, class design, or implementation technique.

The checkpoint tests use the public HTTP contract only. \`POST /api/game/roll\` takes no request body or testing-only headers.
