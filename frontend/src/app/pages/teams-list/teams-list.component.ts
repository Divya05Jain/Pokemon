import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, TeamWithPower } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container page-wrap">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="page-title mb-1">Teams</h1>
          <p class="text-muted small mb-0">Sorted by total power.</p>
        </div>
        <a routerLink="/teams/new" class="btn btn-primary">+ New team</a>
      </div>

      @if (loading) {
        <p class="text-muted loading-dots">Loading</p>
      }
      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }
      @if (!loading && !error && teams.length === 0) {
        <div class="empty-state app-card p-5 text-center">
          <p class="text-muted mb-3">No teams yet. Build your first squad of 6.</p>
          <a routerLink="/teams/new" class="btn btn-primary">Create team</a>
        </div>
      }
      @if (!loading && !error && teams.length > 0) {
        <div class="team-list">
          @for (t of teams; track t.team_id) {
            <a [routerLink]="['/teams', t.team_id]" class="team-row app-card">
              <span class="team-row-name">{{ t.team_name }}</span>
              <span class="team-row-power">Power {{ t.team_power }}</span>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class TeamsListComponent implements OnInit {
  teams: TeamWithPower[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getTeams().subscribe({
      next: (data) => { this.teams = data; this.loading = false; },
      error: (e) => { this.error = e.message || 'Failed to load'; this.loading = false; }
    });
  }
}
