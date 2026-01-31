import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TeamWithPower, BattleResult, BattleRound } from '../../services/api.service';

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

      @if (result && result.rounds.length > 0) {
        <div class="battle-arena app-card overflow-hidden">
          <div class="battle-lineup battle-lineup-top">
            @for (p of result.team1Roster || []; track p.id) {
              <div class="battle-lineup-icon" [class.fainted]="isFainted1(p.id)">
                <img [src]="safeImageUrl(p.image)" [alt]="p.name" (error)="onImgError($event)" />
              </div>
            }
          </div>

          <div class="battle-arena-center">
            <div class="battle-round-nav">
              <button type="button" class="btn btn-dark btn-sm" (click)="prevRound()" [disabled]="currentRoundIndex <= 0">Previous</button>
              <span class="battle-round-badge">Round {{ currentRoundIndex + 1 }}</span>
              <button type="button" class="btn btn-dark btn-sm" (click)="nextRound()" [disabled]="currentRoundIndex >= result.rounds.length - 1">Next</button>
            </div>
            <div class="battle-fighters">
              <div class="battle-fighter battle-fighter-left">
                <div class="battle-hp-bar">
                  <div class="battle-hp-fill" [style.width.%]="currentRoundHp1Percent()"></div>
                </div>
                <img [src]="safeImageUrl(currentRound().team1Pokemon?.image)" [alt]="currentRound().team1Pokemon.name" class="battle-fighter-img" (error)="onImgError($event)" />
                <div class="battle-fighter-name">{{ currentRound().team1Pokemon.name }}</div>
                <div class="battle-power-badge">
                  <span class="battle-power-num">{{ currentRound().team1Pokemon.power }}</span>
                </div>
              </div>
              <div class="battle-fighter battle-fighter-right">
                <div class="battle-hp-bar">
                  <div class="battle-hp-fill" [style.width.%]="currentRoundHp2Percent()"></div>
                </div>
                <img [src]="safeImageUrl(currentRound().team2Pokemon?.image)" [alt]="currentRound().team2Pokemon.name" class="battle-fighter-img" (error)="onImgError($event)" />
                <div class="battle-fighter-name">{{ currentRound().team2Pokemon.name }}</div>
                <div class="battle-power-badge battle-power-badge-right">
                  <span class="battle-power-num">{{ currentRound().team2Pokemon.power }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="battle-lineup battle-lineup-bottom">
            @for (p of result.team2Roster || []; track p.id) {
              <div class="battle-lineup-icon" [class.fainted]="isFainted2(p.id)">
                <img [src]="safeImageUrl(p.image)" [alt]="p.name" (error)="onImgError($event)" />
              </div>
            }
          </div>
        </div>

        <div class="battle-result-footer app-card mt-4 p-4 text-center">
          <div class="battle-result-winner-text">
            Winner: {{ result.winner === 'team1' ? 'Team 1' : result.winner === 'team2' ? 'Team 2' : 'Draw' }}
          </div>
          <div class="text-muted small mt-1">
            Team 1: {{ result.team1Remaining }} left · Team 2: {{ result.team2Remaining }} left
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
  currentRoundIndex = 0;
  loading = false;
  battling = false;
  error = '';
  placeholderImg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect fill="#e8e4df" width="96" height="96"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b6560" font-size="24" font-family="sans-serif">?</text></svg>');

  safeImageUrl(url: string | undefined | null): string {
    const u = (url || '').trim();
    return u && u.startsWith('http') ? u : this.placeholderImg;
  }

  onImgError(e: Event): void {
    const el = e.target as HTMLImageElement;
    if (el && el.src !== this.placeholderImg) el.src = this.placeholderImg;
  }

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
    this.currentRoundIndex = 0;
    this.api.simulateBattle(this.team1Id, this.team2Id).subscribe({
      next: (data) => { this.result = data; this.battling = false; },
      error: (e) => { this.error = e.error?.error || e.message || 'Battle failed'; this.battling = false; }
    });
  }

  isFainted1(id: string): boolean {
    return !!this.result?.fainted1?.includes(id);
  }

  isFainted2(id: string): boolean {
    return !!this.result?.fainted2?.includes(id);
  }

  prevRound() {
    if (this.result && this.currentRoundIndex > 0) this.currentRoundIndex--;
  }

  nextRound() {
    if (this.result && this.currentRoundIndex < this.result.rounds.length - 1) this.currentRoundIndex++;
  }

  currentRound(): BattleRound {
    if (!this.result || !this.result.rounds.length) return {} as BattleRound;
    return this.result.rounds[this.currentRoundIndex] ?? this.result.rounds[0];
  }

  currentRoundHp1Percent(): number {
    const r = this.currentRound();
    const max = r.team1Pokemon?.life ?? 1;
    const cur = r.afterRound?.team1Pokemon?.life ?? 0;
    return max > 0 ? Math.max(0, (100 * cur) / max) : 0;
  }

  currentRoundHp2Percent(): number {
    const r = this.currentRound();
    const max = r.team2Pokemon?.life ?? 1;
    const cur = r.afterRound?.team2Pokemon?.life ?? 0;
    return max > 0 ? Math.max(0, (100 * cur) / max) : 0;
  }
}
