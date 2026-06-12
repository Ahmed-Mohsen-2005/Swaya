# SWAYA Frontend Prototype — Light Brand Refresh

A frontend-only responsive prototype for SWAYA, rebuilt around the original baby-blue logo identity.

## What changed in this version

- Replaced the old logo usage with the provided original SWAYA logo assets.
- Shifted the UI from heavy navy to a light baby-blue visual identity.
- Improved card sizing, spacing, shadows, borders, and responsive behavior.
- Added a more professional welcome/login experience.
- Kept the class-based Teacher Live Session with dynamic simulation every 2 seconds.
- Kept the architecture future-ready: services, mock repositories, Zustand state, simulation engine.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Demo accounts

Password for all accounts: `demo123`

- Teacher: `teacher@swaya.demo`
- Doctor: `doctor@swaya.demo`
- Parent: `parent@swaya.demo`

## Main demo route

Use the Teacher account, then open:

```text
/teacher/live-session
```

Demo flow:

1. Start a class session.
2. Choose a scenario from Demo Scenario Controller.
3. Watch live metrics update every 2 seconds.
4. Open a student alert.
5. Trigger robot action such as Calm Mode.
6. Watch the metrics improve and timeline update.

## Notes

This is still Phase 1: frontend-only, mock/simulated data, no real backend, no real AI, no real robot integration.
