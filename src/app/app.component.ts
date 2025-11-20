import { AsyncPipe, Location, LocationStrategy, PathLocationStrategy, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';

import { filter, take } from 'rxjs';
import { LoadingService } from './common/loading/loading.service';
import { NavbarComponent } from './common/navbar/navbar.component';
import { FooterComponent } from './common/footer/footer.component';
import { LoadingComponent } from './common/loading/loading.component';
import { NotificationComponent } from './common/notification/notification.component';
import { WhastappMobileComponent } from './common/whastapp-mobile/whastapp-mobile.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    NavbarComponent,
    WhastappMobileComponent,
    FooterComponent,
    LoadingComponent,
    NotificationComponent,
  ],
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  loadingSrv = inject(LoadingService);
  private platformId = inject(PLATFORM_ID);
  firstUrl = '';
  utm_source = '';
  location: Location;

  constructor(
    location: Location,
    protected activatedRoute: ActivatedRoute,
  ){
    this.location = location;
  }

  ngOnInit(): void {
    this.loadFirstUrl();
    this.loadUtm();
    this.onNavigation();
  }

  private onNavigation(): void {
    this.router.events
      .subscribe(e => {
        if (e instanceof NavigationEnd) {
          this.onNavigationEnd(e);
        }
      });
  }

  private onNavigationEnd(event: NavigationEnd): void {
    this.jumpTo(event.url);
  }

  private loadFirstUrl() {
    this.firstUrl = window.location.href.split('?')[0];
    // Guardar en el navegador
    localStorage.setItem('FirstUrl',this.firstUrl);    
  }

  private loadUtm() {;
    this.utm_source = location.search.substring(1);
    //console.log(this.utm_source);
    if(this.utm_source)
    {
      localStorage.setItem('UTMSource', this.utm_source);
    }
    else
    {
      localStorage.setItem('UTMSource', 'N/A');
    }
  }

  private jumpTo(url: string = ''): void {
    let offsetTop = 0;

    if (isPlatformBrowser(this.platformId)) {
      let hashindex = url.indexOf('#');
      let section = url.substring(hashindex + 1);

      this.loadingSrv.isLoading$
        .pipe(filter(x => { return x == false }), take(1))
        .subscribe(load => {
          setTimeout(() => {
            const a = document.getElementById(section);
            if (a) { offsetTop = a.offsetTop - 80; }

            window.scroll({ top: offsetTop, behavior: 'smooth' });
          }, 0);
        });
    }
  }
}
