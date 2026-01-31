import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, TeamDetail } from '../../services/api.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container page-wrap">
      <a routerLink="/teams" class="back-link">← Back to teams</a>

      @if (loading) {
        <p class="text-muted loading-dots">Loading</p>
      }
      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }
      @if (team) {
        <div class="team-header mb-4">
          <h1 class="page-title mb-1">{{ team.name }}</h1>
          <p class="text-muted mb-0">Total power: <strong class="text-dark">{{ team.power }}</strong></p>
        </div>
        <div class="row g-3">
          @for (m of team.members; track m.position) {
            <div class="col-6 col-md-4 col-lg-2">
              <div class="member-card app-card h-100 text-center p-3">
                <img [src]="m.pokemon?.image || 'https://via.placeholder.com/80?text=?'" [alt]="m.pokemon?.name" class="member-card-img">
                <div class="member-card-name">{{ m.pokemon?.name }}</div>
                <div class="member-card-stats">P {{ m.pokemon?.power }} · L {{ m.pokemon?.life }}</div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TeamDetailComponent implements OnInit {
  team: TeamDetail | null = null;
  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    this.api.getTeam(id).subscribe({
      next: (data) => { this.team = data; this.loading = false; },
      error: (e) => { this.error = e.message || 'Not found'; this.loading = false; }
    });
  }
}
