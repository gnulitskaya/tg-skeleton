import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SuccessComponent } from './pages/success/success.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'confirm', component: SuccessComponent },
];
