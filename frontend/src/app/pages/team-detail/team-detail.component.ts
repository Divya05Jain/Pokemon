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
                <img [src]="imageSrc(m.pokemon?.name, m.pokemon?.image)" [alt]="m.pokemon?.name" class="member-card-img" (error)="onImgError($event)">
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
  placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="#e8e4df" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b6560" font-size="12">?</text></svg>');

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  imageSrc(name: string | undefined, url: string | undefined): string {
    return this.api.getPokemonImageUrl(name, url) || this.placeholder;
  }

  onImgError(e: Event): void {
    const el = e.target as HTMLImageElement;
    if (el?.src !== this.placeholder) el.src = this.placeholder;
  }

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
