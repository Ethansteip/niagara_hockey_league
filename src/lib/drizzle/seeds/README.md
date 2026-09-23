# Database seeds

Dummy data for local/staging development. Scripts run with [bun](https://bun.sh) (already used by this repo), from the project root, and read the same `.env` as the app.

| Command                | What it seeds                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `bun run seed`         | Everything below, in order                                                              |
| `bun run seed:teams`   | Bruins, Leafs, Wings, Habs                                                              |
| `bun run seed:seasons` | 2025-2026 (active) and 2026-2027, every team registered in both, empty standings        |
| `bun run seed:players` | 60 players: 52 skaters + 8 goalies                                                      |
| `bun run seed:rosters` | 4 rosters for the active season, every player on exactly one (15 per team)              |
| `bun run seed:games`   | Real 2026-27 schedule from `src/data/tuesday_hockey_schedule_2026_27.json`, zeroed standings |

## How it behaves

- Each script **truncates its own table(s) and re-inserts** them. Postgres `CASCADE` wipes dependent rows too, so re-seeding a parent (e.g. seasons) also removes its rosters and games. Re-run the children afterwards, or just run `bun run seed`.
- Serial ids are reset on every run, so teams are always ids 1-4, seasons 1-2, etc.
- Each script checks for the data it depends on and tells you which seed to run first.
- Randomness is seeded, so stats and jersey numbers are identical on every run.
- Games come straight from the schedule JSON: all `scheduled`, scores 0. `team_a` is stored as home and `team_b` as away. Games with TBD teams (the finals) are skipped.
- The active season is whichever entry in `SEASONS` (in `shared.ts`) has `active: true`.
