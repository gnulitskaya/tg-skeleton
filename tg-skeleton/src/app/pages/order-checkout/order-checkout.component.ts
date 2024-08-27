import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TelegramService } from '../../services/telegram.service';
import { ProductsService } from '../../services/products.service';
import { SseService } from '../../services/sse.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-order-checkout',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatButtonModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './order-checkout.component.html',
  styleUrls: ['./order-checkout.component.css']
})
export class OrderCheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  events: any[] = [];
  link: string = '';
  private subscription!: Subscription;

  constructor(private fb: FormBuilder, private tg: TelegramService,
    public productsService: ProductsService,
    private sseService: SseService
  ) {
    this.sendData = this.sendData.bind(this);
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      comment: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      paymentMethod: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.sseService.disconnect();
  }

  fillTestData() {
    // Пример тестовых данных
    const testData = {
      fullName: 'Иван Иванов',
      email: 'ivan.ivanov@example.com',
      phone: '+7 (999) 123-45-67',
      comment: 'Это тестовый комментарий.',
      address: 'Улица Пушкина, дом 1',
      city: 'Москва',
      postalCode: '101000',
      paymentMethod: 'creditCard'
    };

    // Заполнение формы тестовыми данными
    this.checkoutForm.patchValue(testData);
  }

  ngOnInit(): void {
    this.sseService.connect();
    this.subscription = this.sseService.getEvents().subscribe(event => {
      this.link = event.link;
      if(event.link !== '') {
        window.location.href = event.link;
        
      }
      this.events.push(event);
    });

    this.productsService.loadPurchasedItems();
    this.tg.MainButton.hide();
    this.tg.MainButton.onClick(this.sendData);

    this.checkoutForm.valueChanges.subscribe(data => {
      if (this.checkoutForm.valid) {
        this.tg.MainButton.show();
        this.tg.MainButton.setParams({
          text: `Перейти к оплате`
          // text: `Купить ${this.totalPrice.value} ₽`
        })
      }
    })
  }

  sendData() {
    const data = {
      form: this.checkoutForm.value,
      price: this.productsService.totalPrice.value,
      chatId: this.tg.chatId,
      products: this.productsService.purchasedItems
    }
    this.productsService.savePayment(data).subscribe();
    this.tg.sendData(data);
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      console.log('Форма отправлена', this.checkoutForm.value);
      // Здесь вы можете добавить логику для обработки заказа

    }
  }
}