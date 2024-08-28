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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule],
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: number = 1;
  totalCost = 0;
 
  constructor(private tg: TelegramService,
    private paymentService: PaymentService,
    private busyService: BusyService,
    private router: Router,
    public productsService: ProductsService) {
    this.sendData = this.sendData.bind(this);
  }

  ngOnInit() {
    // this.tg.MainButton.setText('Оплатить');
    // this.tg.MainButton.show();
    // this.tg.MainButton.onClick(() => {
    //   return this.makePayment();
    // })
    // this.tg.showAlert();
    this.tg.MainButton.onClick( () => this.router.navigateByUrl('/order'));
    this.productsService.getAllProducts()
      .pipe(
        tap((data) => {
          this.categories = data.categories;
          console.log('data', data);
        })
      )
      .subscribe();
  }

  add(product: Product) {
    product.counter++;
    this.productsService.updatePurchasedItems(product);
    this.result();
  }

  remove(product: Product) {
    if (product.counter > 0) {
      product.counter--;
      this.productsService.updatePurchasedItems(product);
      this.result();
    }
  }

  result() {
    this.tg.MainButton.show();
    this.productsService.totalPrice.next(this.calculateTotal());
    this.tg.MainButton.setParams({
      text: `Оформить заказ`
      // text: `Купить ${this.totalPrice.value} ₽`
    })
    // if (this.totalPrice.value === 0) {
    //   this.tg.MainButton.hide();
    // } else {

    // }
  }

  calculateTotal(): number {
    this.totalCost = this.categories.reduce((total, category) => {
      return total + category.products.reduce((catTotal, product) => {
        return catTotal + (product.price * (product.counter || 0));
      }, 0);
    }, 0);
  
    return this.totalCost;
  }

  sendData() {
    this.tg.sendData({ price: this.productsService.totalPrice.value });
  }

  makePayment() {
    this.busyService.busy();
    const paymentDetails = {
      amount: Number(this.productsService.totalPrice.value),
      description: 'Оплата заказа',
      orderId: Math.random().toString(36).substring(7),
    };

    // alert(paymentDetails.amount);

    this.paymentService.createPayment(paymentDetails)
      .pipe(
        tap((data) => {
          alert('Payment created successfully:');
          // window.location.href = data.confirmation.confirmation_url;
          // this.route.navigateByUrl(data.confirmation.confirmation_url);
        }),
        catchError((err) => {
          alert('Error creating payment:');
          this.busyService.idle();
          return of(null);
        })
      ).subscribe();
  }

  selectCategory(category: number): void {
    this.selectedCategory = category;
  }

}

// const getTotalPrice = (items: Product[] = []): number => {
//   return items.reduce((acc, item) => {
//     return acc + item.price;
//   }, 0);
// };