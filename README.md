# Pokemon Battle

Full-stack app to manage Pokémon, build teams of 6, and simulate battles. Angular, Node.js, Bootstrap, Supabase.

## Features

- List and edit Pokémon (type, power, life, image)
- Create teams of 6 Pokémon
- List teams by total power
- Simulate battle between two teams (rounds, damage, winner)

## Tech

- **Frontend:** Angular 18, Bootstrap 5, TypeScript
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)

## Setup

**Prerequisites:** Node.js 18+, npm, Supabase account.

### 1. Database

Create a project at [supabase.com](https://supabase.com). In SQL Editor run, in order:

1. `database/01_schema.sql`
2. `database/00_rls_policies.sql`
3. `database/03_seed_pokemon_types.sql`
4. `database/02_seed_weakness.sql`
5. `database/04_seed_pokemons.sql`
6. `database/05_functions.sql`

Copy Project URL and anon key from Settings → API.

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your `SUPABASE_URL` and `SUPABASE_ANON_KEY`. (Backend uses `.env` for secrets; do not commit it. See `.env.example` for required variables.)

```bash
npm install
npm start
```

Runs at http://localhost:3000.

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

Open http://localhost:4200. Set `apiUrl` in `src/environments/environment.ts` if the API is elsewhere.

## Project structure

- `database/` – schema, seed data, RLS, team functions
- `backend/` – Express API (pokemon, teams, battle, types)
- `frontend/` – Angular app (pages + api service)

## Design

**Schema:**Pokémon types (fire, water, grass) are stored in a separate table and referenced by each Pokémon to avoid duplication. A weakness table defines the damage factor between attacker and defender types and is used directly in battle calculations.

Each Pokémon has a power value (10–100) and life value (50–100). Teams are stored using a team table with a team_pokemon mapping that contains exactly six slots, allowing duplicate Pokémon within a team.

Two PostgreSQL functions are implemented:

insert_team(name, pokemon_ids[6]) to create a team of six Pokémon

get_teams_with_power() to return all teams ordered by total team power


**Battle:** 1v1 rounds; damage = opponent_power × weakness_factor(attacker_type, defender_type). When a Pokémon’s life ≤ 0, next from that team enters. Winner is the team with Pokémon left. Algorithm keeps two indices (current Pokémon per team), applies damage each round, and advances indices when life ≤ 0.
