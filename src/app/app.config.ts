import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { LoadingInterceptor } from './common/loading/loading.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routes: Routes = [
  //{ path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '', loadComponent: () => import('./views/company/company.component') },
  { path: 'enviado', loadComponent: () => import('./views/thanks/thanks.component') },
  { path: 'pagina-no-encontrada', loadComponent: () => import('./views/error/error.component') },
  { path: '**', redirectTo: 'pagina-no-encontrada' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom([BrowserAnimationsModule]),
    provideHttpClient(withInterceptors([LoadingInterceptor])),
  ],
};
