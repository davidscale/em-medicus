import { Component, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CompanyService } from 'src/app/services/company.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Company } from 'src/app/shared/classes/company';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [RouterLink]
})
export class NavbarComponent implements OnInit {
  company: Company;
  onTop: boolean = true;

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private companySrv = inject(CompanyService);

  ngOnInit(): void {
    this.getCompany();
  }

  onBtnCompany() {
    const path = ['/'];
    this.router.navigate(path, { fragment: '' });

    // Refresco url para que usuario pueda volvear a scrollear si hace click en el boton rosita
    setTimeout(() => { this.router.navigate(path); }, 0);
  }

  private getCompany(): void {
    this.companySrv.getCurrent().subscribe(data => { this.company = data; });
  }

  @HostListener('window:scroll', ['$event']) onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.onTop = verticalOffset == 0;
    }
  }
}
