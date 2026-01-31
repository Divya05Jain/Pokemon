import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Pokemon, PokemonType } from '../../services/api.service';

@Component({
  selector: 'app-pokemon-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container page-wrap">
      <a routerLink="/pokemon" class="back-link">← Back to list</a>
      <h1 class="page-title">Edit Pokémon</h1>

      @if (loading) {
        <p class="text-muted loading-dots">Loading</p>
      }
      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }
      @if (pokemon && types.length) {
        <form (ngSubmit)="save()" class="edit-form app-card p-4" style="max-width: 480px;">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" class="form-control" [(ngModel)]="pokemon.name" name="name" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Type</label>
            <select class="form-select" [(ngModel)]="pokemon.type" name="type" required>
              @for (t of types; track t.id) {
                <option [value]="t.id">{{ t.name }}</option>
              }
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Image URL</label>
            <input type="text" class="form-control" [(ngModel)]="pokemon.image" name="image" placeholder="https://...">
          </div>
          <div class="row g-3">
            <div class="col-6">
              <label class="form-label">Power (10–100)</label>
              <input type="number" class="form-control" [(ngModel)]="pokemon.power" name="power" min="10" max="100" required>
            </div>
            <div class="col-6">
              <label class="form-label">Life (50–100)</label>
              <input type="number" class="form-control" [(ngModel)]="pokemon.life" name="life" min="50" max="100" required>
            </div>
          </div>
          <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-primary">Save</button>
            <a routerLink="/pokemon" class="btn btn-outline-secondary">Cancel</a>
          </div>
        </form>
      }
    </div>
  `
})
export class PokemonEditComponent implements OnInit {
  pokemon: Partial<Pokemon> | null = null;
  types: PokemonType[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    this.api.getTypes().subscribe({
      next: (types) => { this.types = types; },
      error: () => {}
    });
    this.api.getPokemon(id).subscribe({
      next: (p) => { this.pokemon = { ...p, type: (p as any).type }; this.loading = false; },
      error: (e) => { this.error = e.message || 'Not found'; this.loading = false; }
    });
  }

  save() {
    if (!this.pokemon?.id) return;
    this.api.updatePokemon(this.pokemon.id, {
      name: this.pokemon.name,
      type: this.pokemon.type,
      image: this.pokemon.image,
      power: this.pokemon.power,
      life: this.pokemon.life
    }).subscribe({
      next: () => this.router.navigate(['/pokemon']),
      error: (e) => this.error = e.error?.error || e.message || 'Save failed'
    });
  }
}
