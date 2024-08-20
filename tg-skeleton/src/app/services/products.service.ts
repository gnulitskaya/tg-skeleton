import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private jsonUrl = 'assets/products.json';
  purchasedItems: { product: Product; quantity: number }[] = [];
constructor(private http: HttpClient) { }

getAllCourses(): Observable<any> {
  return this.http.get(this.jsonUrl).pipe(
    tap(courses => {
      // this.quizStore.loadItems(courses, true);
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
}

}
