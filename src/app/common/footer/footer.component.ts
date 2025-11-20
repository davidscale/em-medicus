import { NgStyle  } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Company } from 'src/app/shared/classes/company';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgStyle,
  ]
})
export class FooterComponent implements OnInit {
  company: Company;
  year: number = 0;
  private companySrv = inject(CompanyService);

  ngOnInit(): void {
    this.getCompany();
    this.getYear();
  }

  private getCompany(): void {
    this.companySrv.getCurrent().subscribe(data => {
      this.company = data;
    });
  }

  private getYear() {
    this.year = new Date().getFullYear();
  }
}
