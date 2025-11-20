import { RouterLink } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-whastapp-mobile',
  templateUrl: './whastapp-mobile.component.html',
  standalone: true,
  imports: [RouterLink]
})
export class WhastappMobileComponent implements OnInit {
  public wspNumber: string;
  public companyName: string = 'Hominis';
  public link: string;

  private companySrv = inject(CompanyService);

  ngOnInit(): void {
    this.getCompanyData();
    //this.link = this.getLink();
  }

  private getCompanyData() {
    this.companySrv.getCompanyData(12)
      .subscribe((data: string) => {
        this.wspNumber = data;
        this.link = this.getLink();
      });
  }

  /**
   * This method set link of wsp depending value of params
   * @param name
   * @param wsp
   */
  private getLink(): string {
    let rta = `https://wa.me/5491152799724?text=Hola!%20C%C3%B3mo%20est%C3%A1n?%20Tengo%20una%20consulta%20sobre%20${this.companyName}`;

    if (this.wspNumber) {
      rta = `https://wa.me/${this.wspNumber}?text=Hola!%20C%C3%B3mo%20est%C3%A1n?%20Tengo%20una%20consulta%20sobre%20${this.companyName}`;
    }

    return rta;
  }
}
