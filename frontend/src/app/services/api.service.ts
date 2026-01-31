import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const BASE = environment.apiUrl;

export interface PokemonType {
  id: string;
  name: string;
}

export interface Pokemon {
  id: string;
  name: string;
  type: string;
  image?: string;
  power: number;
  life: number;
  pokemon_type?: { id: string; name: string };
}

export interface TeamWithPower {
  team_id: string;
  team_name: string;
  team_power: number;
  created_at: string;
}

export interface TeamMember {
  position: number;
  pokemon: Pokemon;
}

export interface TeamDetail {
  id: string;
  name: string;
  members: TeamMember[];
  power: number;
}

export interface BattleRound {
  description: string;
  team1Pokemon: { id: string; name: string; image?: string; life: number; power: number };
  team2Pokemon: { id: string; name: string; image?: string; life: number; power: number };
  afterRound: { team1Pokemon: { life: number }; team2Pokemon: { life: number } };
}

export interface BattleRosterItem {
  id: string;
  name: string;
  image?: string;
}

export interface BattleResult {
  winner: 'team1' | 'team2' | null;
  rounds: BattleRound[];
  team1Remaining: number;
  team2Remaining: number;
  team1Roster?: BattleRosterItem[];
  team2Roster?: BattleRosterItem[];
  fainted1?: string[];
  fainted2?: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getTypes() {
    return this.http.get<PokemonType[]>(`${BASE}/types`);
  }

  getPokemons() {
    return this.http.get<Pokemon[]>(`${BASE}/pokemon`);
  }

  getPokemon(id: string) {
    return this.http.get<Pokemon>(`${BASE}/pokemon/${id}`);
  }

  updatePokemon(id: string, data: Partial<Pokemon>) {
    return this.http.patch<Pokemon>(`${BASE}/pokemon/${id}`, data);
  }

  getTeams() {
    return this.http.get<TeamWithPower[]>(`${BASE}/teams`);
  }

  getTeam(id: string) {
    return this.http.get<TeamDetail>(`${BASE}/teams/${id}`);
  }

  addTeam(name: string, pokemonIds: string[]) {
    return this.http.post<{ id: string; name: string }>(`${BASE}/teams`, { name, pokemonIds });
  }

  simulateBattle(team1Id: string, team2Id: string) {
    return this.http.post<BattleResult>(`${BASE}/battle/simulate`, { team1Id, team2Id });
  }
}
