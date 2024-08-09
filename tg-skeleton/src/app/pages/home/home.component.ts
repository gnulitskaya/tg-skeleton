import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { TelegramService } from '../../services/telegram.service';
import { PaymentService } from '../../services/payment.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { BusyService } from '../../services/busy.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class HomeComponent implements OnInit {
  private addedItems: Product[] = [];
  public totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public products: Product[] = [
    {
      id: 0,
      name: "Кожаные ботильоны Angels mid",
      description: "Наш бестселлер с новой высотой каблука 9.5 см",
      price: 11400,
      imageUrl: "product1.jpeg"
    },
    {
      id: 1,
      name: "Ботильоны Grey Snake",
      description: "Модель из эко-кожи рептилии в светло-сером  оттенке",
      price: 6200,
      imageUrl: "product2.jpeg"
    },
    {
      id: 2,
      name: "Ботфорты из эко-кожи Velour Red",
      description: "Ботфорты выполнены из мягкой искуственной кожи",
      price: 9600,
      imageUrl: "product3.jpeg"
    }
  ]
  constructor(private tg: TelegramService, 
    private paymentService: PaymentService,
    private busyService: BusyService,
    private route: Router) { 
    this.sendData = this.sendData.bind(this);
  }

  ngOnInit() {
    this.tg.MainButton.setText('Отправить');
    this.tg.MainButton.show();
    // this.tg.MainButton.onClick(() => {
    //   return this.makePayment();
    // })
    this.tg.MainButton.onClick(this.sendData)
  }
  
  add(product: Product): void {
    const alreadyAdded = this.addedItems.find(item => item.id === product.id);
    let newItems: any[] = [];

    if (alreadyAdded) {
      newItems = this.addedItems.filter(item => item.id !== product.id);
    } else {
      newItems = [...this.addedItems, product];
    }
    // console.log('alreadyAdded', alreadyAdded);
    this.addedItems = newItems;
    // console.log('addedItems', this.addedItems);
    if (newItems.length === 0) {
      this.tg.MainButton.hide();
    } else {
      this.tg.MainButton.show();
      this.totalPrice.next(getTotalPrice(newItems));
      this.tg.MainButton.setParams({
        text: `Купить ${this.totalPrice.value} ₽`
      })
    }
  }

  sendData() {
    this.tg.sendData({price: getTotalPrice(this.addedItems)});
  }

  makePayment() {
    this.busyService.busy();
    const paymentDetails = {
      amount: Number(this.totalPrice.value),
      description: 'Оплата заказа',
      orderId: Math.random().toString(36).substring(7),
    };

    // alert(paymentDetails.amount);

    this.paymentService.createPayment(paymentDetails)
    .pipe(
      tap((data) => {
        alert('Payment created successfully:');
        window.location.href = data.confirmation.confirmation_url;
        // this.route.navigateByUrl(data.confirmation.confirmation_url);
      }),
      catchError((err) => {
        alert('Error creating payment:');
        this.busyService.idle();
        return of(null);
      })
    ).subscribe();
  }
}

const getTotalPrice = (items: Product[] = []): number => {
  return items.reduce((acc, item) => {
    return acc + item.price;
  }, 0);
};