# HTTP Checkpoints

These tests treat the backend as a black box. They import no student or reference implementation code.

Start the API with \`PROPERTY_EMPIRE_TESTING=1\`, then run:

\`python student-tests/run_checkpoint.py 4 --api-url http://localhost:8123\`

Checkpoint N runs exercises 1 through N. A failing assertion describes an observable API behavior to revisit. The tests intentionally leave implementation structure to the student.
