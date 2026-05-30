import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendService } from '../../core/services/backend.service';

/**
 * Chip inline para colocar dentro de una ion-toolbar (centrado).
 * Muestra el backend activo (MEAN/Spring) y permite alternar con un click.
 */
@Component({
  selector: 'app-backend-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="backend-chip"
      [class.backend-chip--mean]="active() === 'mean'"
      [class.backend-chip--spring]="active() === 'spring'"
      (click)="toggle()"
      [title]="'Backend activo: ' + label() + ' (click para cambiar)'">
      <span class="backend-chip__dot"></span>
      {{ label() }}
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 4px 0;
      }
      .backend-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        font: 600 11px/1 'Inter', system-ui, sans-serif;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #fff;
        background: rgba(17, 24, 39, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease;
      }
      .backend-chip:hover { transform: translateY(-1px); }
      .backend-chip:active { transform: translateY(0); }

      .backend-chip__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
      }

      .backend-chip--mean   { color: #34d399; }   /* verde Node */
      .backend-chip--spring { color: #fb923c; }   /* naranja Java */
    `,
  ],
})
export class BackendToggleComponent {
  private readonly backend = inject(BackendService);
  readonly active = this.backend.active;

  label(): string {
    return this.active() === 'mean' ? 'Node' : 'Java';
  }

  toggle() {
    this.backend.setBackend(this.active() === 'mean' ? 'spring' : 'mean');
    // El listado se recarga la próxima vez que se entre. Si estamos
    // ya en /players, list.page lo refresca por su propio ionViewWillEnter.
    // Para que el cambio sea inmediato disparamos un reload suave:
    location.reload();
  }
}
