import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Pokemon } from '../../services/api.service';

@Component({
  selector: 'app-team-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container page-wrap">
      <a routerLink="/teams" class="back-link">← Back to teams</a>
      <h1 class="page-title">New team</h1>
      <p class="text-muted mb-4">Pick 6 Pokémon. Same Pokémon can appear more than once.</p>

      <div class="team-form app-card p-4" style="max-width: 640px;">
        <div class="mb-4">
          <label class="form-label">Team name</label>
          <input type="text" class="form-control form-control-lg" [(ngModel)]="teamName" name="teamName" placeholder="e.g. Team Fire">
        </div>
        <div class="row g-3 mb-4">
          @for (idx of [0,1,2,3,4,5]; track idx) {
            <div class="col-md-6">
              <label class="form-label small text-muted">Slot {{ idx + 1 }}</label>
              <select class="form-select" [(ngModel)]="selectedIds[idx]" name="slot{{ idx }}">
                <option [ngValue]="null">— Choose —</option>
                @for (p of pokemons; track p.id) {
                  <option [ngValue]="p.id">{{ p.name }} ({{ p.pokemon_type?.name }})</option>
                }
              </select>
            </div>
          }
        </div>
        @if (error) {
          <div class="alert alert-danger mb-3">{{ error }}</div>
        }
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-primary" (click)="submit()" [disabled]="!canSubmit() || loading">
            Create team
          </button>
          @if (loading) {
            <span class="text-muted small loading-dots">Saving</span>
          }
        </div>
      </div>
    </div>
  `
})
export class TeamNewComponent implements OnInit {
  teamName = '';
  pokemons: Pokemon[] = [];
  selectedIds: (string | null)[] = [null, null, null, null, null, null];
  loading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getPokemons().subscribe({
      next: (data) => this.pokemons = data,
      error: () => this.error = 'Failed to load Pokémon'
    });
  }

  canSubmit(): boolean {
    return !!this.teamName?.trim() && this.selectedIds.every(id => !!id);
  }

  submit() {
    if (!this.canSubmit()) return;
    const ids = this.selectedIds.filter((id): id is string => !!id);
    this.loading = true;
    this.error = '';
    this.api.addTeam(this.teamName.trim(), ids).subscribe({
      next: () => this.router.navigate(['/teams']),
      error: (e) => { this.error = e.error?.error || e.message || 'Failed'; this.loading = false; }
    });
  }
}
