import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { HomeComponent } from './features/home/home.component';
import { ResourceListComponent } from './features/resources/resource-list/resource-list.component';
import { TicketListComponent } from './features/tickets/ticket-list/ticket-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ForbiddenComponent } from './features/forbidden/forbidden.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
    {
        path: '',
        component: AppShellComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'resources', component: ResourceListComponent },
            { path: 'tickets', component: TicketListComponent },
        ]
    },
    { path: 'auth/login', component: LoginComponent },
    { path: 'forbidden', component: ForbiddenComponent },
    { path: '**', component: NotFoundComponent }
];
