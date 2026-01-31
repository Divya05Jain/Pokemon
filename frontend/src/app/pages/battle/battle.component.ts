import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TeamWithPower, BattleResult } from '../../services/api.service';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container page-wrap">
      <h1 class="page-title">Battle</h1>
      <p class="text-muted mb-4">Choose two teams and run a simulated battle.</p>

      <div class="battle-setup app-card p-4 mb-4">
        <div class="row align-items-end g-3">
          <div class="col-md-5">
            <label class="form-label">Team 1</label>
            <select class="form-select form-select-lg" [(ngModel)]="team1Id" name="team1">
              <option [ngValue]="null">— Select team —</option>
              @for (t of teams; track t.team_id) {
                <option [ngValue]="t.team_id">{{ t.team_name }} ({{ t.team_power }})</option>
              }
            </select>
          </div>
          <div class="col-md-2 text-center pb-2">
            <span class="battle-vs">VS</span>
          </div>
          <div class="col-md-5">
            <label class="form-label">Team 2</label>
            <select class="form-select form-select-lg" [(ngModel)]="team2Id" name="team2">
              <option [ngValue]="null">— Select team —</option>
              @for (t of teams; track t.team_id) {
                <option [ngValue]="t.team_id">{{ t.team_name }} ({{ t.team_power }})</option>
              }
            </select>
          </div>
        </div>
        <div class="text-center mt-4">
          <button type="button" class="btn btn-danger btn-lg px-4" (click)="startBattle()"
            [disabled]="!team1Id || !team2Id || team1Id === team2Id || battling">
            {{ battling ? 'Running battle…' : 'Start battle' }}
          </button>
        </div>
      </div>

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (result) {
        <div class="battle-result app-card overflow-hidden">
          <div class="battle-result-header">
            <span class="battle-result-winner">
              Winner: {{ result.winner === 'team1' ? 'Team 1' : result.winner === 'team2' ? 'Team 2' : 'Draw' }}
            </span>
            <span class="battle-result-remaining">
              Team 1: {{ result.team1Remaining }} left · Team 2: {{ result.team2Remaining }} left
            </span>
          </div>
          <div class="battle-rounds p-4">
            <h3 class="h6 text-muted mb-3">Rounds</h3>
            <div class="round-list">
              @for (r of result.rounds; track $index; let i = $index) {
                <details class="round-item">
                  <summary>Round {{ i + 1 }}: {{ r.team1Pokemon?.name }} vs {{ r.team2Pokemon?.name }}</summary>
                  <div class="round-detail small text-muted">
                    <p class="mb-1">Team 1 · {{ r.team1Pokemon?.name }}: {{ r.team1Pokemon?.life }} → {{ r.afterRound?.team1Pokemon?.life }} life</p>
                    <p class="mb-0">Team 2 · {{ r.team2Pokemon?.name }}: {{ r.team2Pokemon?.life }} → {{ r.afterRound?.team2Pokemon?.life }} life</p>
                  </div>
                </details>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BattleComponent implements OnInit {
  teams: TeamWithPower[] = [];
  team1Id: string | null = null;
  team2Id: string | null = null;
  result: BattleResult | null = null;
  loading = false;
  battling = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getTeams().subscribe({
      next: (data) => { this.teams = data; this.loading = false; },
      error: (e) => { this.error = e.message || 'Failed to load teams'; this.loading = false; }
    });
  }

  startBattle() {
    if (!this.team1Id || !this.team2Id || this.team1Id === this.team2Id) return;
    this.battling = true;
    this.error = '';
    this.result = null;
    this.api.simulateBattle(this.team1Id, this.team2Id).subscribe({
      next: (data) => { this.result = data; this.battling = false; },
      error: (e) => { this.error = e.error?.error || e.message || 'Battle failed'; this.battling = false; }
    });
  }
}
