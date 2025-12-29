import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forbidden',
    standalone: true,
    imports: [RouterLink],
    template: `
    <div class="text-center">
      <h1>403</h1>
      <p>Access Forbidden</p>
      <a routerLink="/" class="p-button">Go Home</a>
    </div>
  `
})
export class ForbiddenComponent { }
