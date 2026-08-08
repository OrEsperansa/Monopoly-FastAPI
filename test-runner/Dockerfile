FROM python:3.13-slim

WORKDIR /runner

COPY test-runner/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY test-runner/app.py ./app.py
COPY student-tests ./student-tests

ENV RUNNER_DOCKERIZED=1

EXPOSE 9000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9000"]
