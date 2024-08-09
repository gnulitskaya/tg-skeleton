import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaymentData } from '../models/payment-details.model';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Props {
    amount: number;
    description: string;
    orderId: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    // https://cors-anywhere.herokuapp.com/
    private apiUrl = 'https://api.yookassa.ru/v3/payments';

    constructor(private http: HttpClient) { }

    createPayment(details: Props): Observable<PaymentData> {
        const body = {
            amount: {
                value: details.amount.toString(),
                currency: 'RUB'
            },
            capture: true,
            description: details.description,
            metadata: {
                order_id: details.orderId
            },
            confirmation: {
                type: 'redirect',
                return_url: environment.YOOKASSA_CALLBACK_URL
            }
        };

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Idempotence-Key': Math.random().toString(36).substring(7),
            'Access-Control-Allow-Origin': 'http://localhost:4200',
            "Access-Control-Allow-Headers" : "Origin,X-Requested-With,Content-Type,Accept",
            // //   "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
            'Authorization': 'Basic ' + btoa(environment.YOKASSA_ID + ':' + environment.YOOKASSA_API)
        });

        const options = {
            headers: headers,
            auth: {
                username: environment.YOKASSA_ID,
                password: environment.YOOKASSA_API
            }
        };

        // alert('createPayment');

        return this.http.post<PaymentData>(this.apiUrl, body, options).pipe(
            catchError((err: any) => {
                // alert('error');
                // alert(err.error);
                return of(err);
            })
        );
    }

}
