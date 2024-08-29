import { Category, Product } from './../models/product';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'https://tgmini.ru:8443/api/';
  private jsonUrl = 'assets/products.json';
  public purchasedItems: { product: Product }[] = [];
  public totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<any> {
    return this.http.get(this.jsonUrl).pipe(
      map((data: any) => {
        const updatedData = {
          ...data,
          categories: data.categories.map((category: Category) => ({
            ...category,
            products: category.products.map(product => ({
              ...product,
              quantity: 0,
              size: product.availableSizes ? product.availableSizes[0] : null,
            }))
          }))
        };

        return updatedData.categories;
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
    console.log(product);
    if (existingItem) {
      existingItem.product.quantity = product.quantity || 0;
    } else {
      if (product.quantity > 0) {
        this.purchasedItems.push({product});
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
