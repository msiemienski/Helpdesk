import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink],
    template: `
    <div class="text-center">
      <h1>404</h1>
      <p>Page not found</p>
      <a routerLink="/" class="p-button">Go Home</a>
    </div>
  `
})
export class NotFoundComponent { }
