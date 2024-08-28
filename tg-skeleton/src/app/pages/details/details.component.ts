import { Component, OnInit } from '@angular/core';
import { Category, Product } from '../../models/product';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { tap } from 'rxjs/operators';
import { TelegramService } from '../../services/telegram.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  product: Product | null = null;
  productId: string | null = null;
  categories: Category[] = [];
  totalCost = 0;

  constructor(private route: ActivatedRoute,
    private productsService: ProductsService,
    private tg: TelegramService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      this.fetchProductDetails(this.productId);
    });
  }

  fetchProductDetails(id: string | null) {
    this.productsService.getAllProducts()
      .pipe(
        tap((data) => {
          this.categories = data.categories;
          this.product = this.findProductById(Number(id), data.categories);
        })
      )
      .subscribe();
  }

  add(product: Product | null) {
    if (product) {
      product.counter++;
      this.productsService.updatePurchasedItems(product);
      this.result();
    }
  }

  remove(product: Product | null) {
    if (product && product.counter > 0) {
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
  }

  calculateTotal(): number {
    this.totalCost = this.categories.reduce((total, category) => {
      return total + category.products.reduce((catTotal, product) => {
        return catTotal + (product.price * (product.counter || 0));
      }, 0);
    }, 0);

    return this.totalCost;
  }

  findProductById(productId: number, categories: any): Product | null {
    for (const category of categories) {
      const product = category.products.find((product: any) => product.id === productId);
      if (product) {
        return product;
      }
    }
    return null;
  }

}
