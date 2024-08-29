import { routes } from './../../app.routes';
import { Component, OnInit } from '@angular/core';
import { Category, Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { TelegramService } from '../../services/telegram.service';
import { PaymentService } from '../../services/payment.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { BusyService } from '../../services/busy.service';
import { ProductsService } from '../../services/products.service';
import { MatButtonModule } from '@angular/material/button';
import { FormButtonToggleComponent } from '../../components/shared/form-button-toggle/form-button-toggle.component';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, FormButtonToggleComponent, FormsModule, ReactiveFormsModule,],
})
export class HomeComponent implements OnInit {
  // productForm: FormGroup;
  categories: Category[] = [];
  selectedCategory: number = 1;
  totalCost = 0;

  constructor(private tg: TelegramService,
    private router: Router,
    public productsService: ProductsService) {
    this.sendData = this.sendData.bind(this);
  }

  ngOnInit() {
    this.tg.MainButton.onClick(() => this.router.navigateByUrl('/order'));
    this.getProducts();
  }

  getProducts() {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      this.categories = JSON.parse(storedCategories);
    } else {
      this.productsService.getAllProducts()
        .pipe(
          tap((data) => {
            this.categories = data;
            localStorage.setItem('categories', JSON.stringify(data));
          })
        )
        .subscribe();
    }
  }

  add(product: Product) {
    console.log(product.quantity);
    product.quantity++;
    this.productsService.updatePurchasedItems(product);
    this.result();
  }

  remove(product: Product) {
    if (product.quantity > 0) {
      product.quantity--;
      this.productsService.updatePurchasedItems(product);
      this.result();
    }
  }

  selectSize(product: Product, size: string) {
    product.size = size;
  }

  result() {
    this.tg.MainButton.show();
    this.productsService.totalPrice.next(this.calculateTotal());
    this.tg.MainButton.setParams({
      text: `Оформить заказ`
      // text: `Купить ${this.totalPrice.value} ₽`
    })
  }

  calculateTotal(): number {
    this.totalCost = this.categories.reduce((total, category) => {
      return total + category.products.reduce((catTotal, product) => {
        return catTotal + (product.price * (product.quantity || 0));
      }, 0);
    }, 0);

    return this.totalCost;
  }

  sendData() {
    this.tg.sendData({ price: this.productsService.totalPrice.value });
  }

  selectCategory(category: number): void {
    this.selectedCategory = category;
  }

  goToOrder() {
    this.router.navigateByUrl('/order')
  }

}

// const getTotalPrice = (items: Product[] = []): number => {
//   return items.reduce((acc, item) => {
//     return acc + item.price;
//   }, 0);
// };