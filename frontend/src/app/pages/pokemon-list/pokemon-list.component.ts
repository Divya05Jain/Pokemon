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
                  <img [src]="p.image || 'https://via.placeholder.com/160?text=?'" [alt]="p.name" class="pokemon-card-image">
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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getPokemons().subscribe({
      next: (data) => { this.pokemons = data; this.loading = false; },
      error: (e) => { this.error = e.message || 'Failed to load'; this.loading = false; }
    });
  }
}
