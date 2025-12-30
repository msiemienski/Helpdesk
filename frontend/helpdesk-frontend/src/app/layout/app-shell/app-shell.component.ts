import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-column">
      <app-navbar></app-navbar>
      <main class="flex-grow-1 p-4 surface-ground">
        <div class="surface-card p-4 shadow-1 border-round">
          <router-outlet></router-outlet>
        </div>
      </main>
      <footer class="p-3 text-center text-500 text-sm">
        &copy; 2025 HelpDesk App
      </footer>
    </div>
  `
})
export class AppShellComponent { }
