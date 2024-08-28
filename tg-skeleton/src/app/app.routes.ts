import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SuccessComponent } from './pages/success/success.component';
import { OrderCheckoutComponent } from './pages/order-checkout/order-checkout.component';
import { DetailsComponent } from './pages/details/details.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'order', component: OrderCheckoutComponent, pathMatch: 'full' },
    { path: 'confirm', component: SuccessComponent },
    { path: 'details/:id', component: DetailsComponent },
];
