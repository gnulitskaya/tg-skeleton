import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'https://tgmini.ru:8443/';
  private jsonUrl = 'assets/products.json';
  public purchasedItems: { product: Product; quantity: number }[] = [];
  public totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) { }

  getAllCourses(): Observable<any> {
    return this.http.get(this.jsonUrl).pipe(
      tap(courses => {
        // this.quizStore.loadItems(courses, true);
      })
    );
  }

  savePayment(data: any): Observable<any>  {
    return this.http.post(this.apiUrl + 'webapp', data).pipe(
      tap(data => {
        console.log(data);
      })
    );
  }

  updatePurchasedItems(product: Product) {
    const existingItem = this.purchasedItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity = product.counter || 0;
    } else {
      if (product.counter > 0) {
        this.purchasedItems.push({ product, quantity: product.counter });
      }
    }

    // Сохраняем обновленный массив в localStorage
    localStorage.setItem('purchasedItems', JSON.stringify(this.purchasedItems));
  }

  // Метод для загрузки данных из localStorage при инициализации
  loadPurchasedItems() {
    const savedItems = localStorage.getItem('purchasedItems');
    console.log('savedItems', savedItems);
    if (savedItems) {
      this.purchasedItems = JSON.parse(savedItems);
    } else {
      this.purchasedItems = []; // Инициализируем пустым массивом, если данных нет
    }
  }

  // updatePurchasedItems(product: Product) {
  //   const existingItem = this.purchasedItems.find(item => item.product.id === product.id);

  //   if (existingItem) {
  //     existingItem.quantity = product.counter || 0;
  //   } else {
  //     if (product.counter > 0) {
  //       this.purchasedItems.push({ product, quantity: product.counter });
  //     }
  //   }
  // }

}
