import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideNoopAnimations(),
  provideHttpClient(withInterceptorsFromDi()),
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LoadingInterceptor,
    multi: true
  }
  ],
};
