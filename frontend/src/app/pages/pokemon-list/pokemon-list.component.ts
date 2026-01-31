import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Pokemon } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container page-wrap">
      <h1 class="page-title">All Pokémon</h1>
      <p class="text-muted mb-4">Tap a card to edit stats.</p>

      @if (loading) {
        <p class="text-muted loading-dots">Loading</p>
      }
      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }
      @if (!loading && !error) {
        <div class="row g-4">
          @for (p of pokemons; track p.id) {
            <div class="col-sm-6 col-lg-4">
              <div class="pokemon-card app-card h-100">
                <div class="pokemon-card-image-wrap">
                  <img [src]="imageSrc(p.name, p.image)" [alt]="p.name" class="pokemon-card-image" (error)="onImgError($event)">
                </div>
                <div class="pokemon-card-body">
                  <h3 class="pokemon-card-name">{{ p.name }}</h3>
                  <span class="badge badge-type badge-type-{{ (p.pokemon_type?.name ?? '').toLowerCase() }}" [class.bg-secondary]="!p.pokemon_type?.name">
                    {{ p.pokemon_type?.name ?? '—' }}
                  </span>
                  <div class="pokemon-card-stats">
                    <span>Power {{ p.power }}</span>
                    <span class="stat-sep">·</span>
                    <span>Life {{ p.life }}</span>
                  </div>
                  <a [routerLink]="['/pokemon', p.id, 'edit']" class="pokemon-card-edit">Edit</a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];
  loading = false;
  error = '';
  placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect fill="#e8e4df" width="160" height="120"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b6560" font-size="14">?</text></svg>');

  constructor(private api: ApiService) {}

  imageSrc(name: string | undefined, url: string | undefined): string {
    return this.api.getPokemonImageUrl(name, url) || this.placeholder;
  }

  onImgError(e: Event): void {
    const el = e.target as HTMLImageElement;
    if (el?.src !== this.placeholder) el.src = this.placeholder;
  }

  ngOnInit() {
    this.loading = true;
    this.api.getPokemons().subscribe({
      next: (data) => { this.pokemons = data; this.loading = false; },
      error: (e) => { this.error = e.message || 'Failed to load'; this.loading = false; }
    });
  }
}
