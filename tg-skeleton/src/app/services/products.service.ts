import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private jsonUrl = 'assets/products.json';
constructor(private http: HttpClient) { }

getAllCourses(): Observable<any> {
  return this.http.get(this.jsonUrl).pipe(
    tap(courses => {
      // this.quizStore.loadItems(courses, true);
    })
  );
}

}
