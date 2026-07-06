# Shared UI

This is the React + Vite + TypeScript frontend for Property Empire Classroom.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL and enter the backend URL:

- `http://localhost:8000`
- `http://192.168.x.x:8000`

The app stores the API URL in `localStorage`.

## Screens

- API Connection
- Game Setup
- Game Board

## Components

- `ApiConnector`
- `GameSetup`
- `GameBoard`
- `Tile`
- `PlayerToken`
- `PlayerPanel`
- `ActionPanel`
- `EventLog`

## Frontend Rule

The UI does not calculate game rules. It only:

- renders board state
- renders players
- renders ownership and money
- renders the event log
- renders buttons from `available_actions`
- sends HTTP requests

Movement, rent, tile effects, winner detection, and turn order all belong to the backend.
