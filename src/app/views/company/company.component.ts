import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CompanyService } from 'src/app/services/company.service';
import { ConfigService } from 'src/app/services/config.service';
import { FormComponent } from 'src/app/views/company/form/form.component';
import { NgClass, NgStyle, TitleCasePipe, UpperCasePipe, LowerCasePipe, } from '@angular/common';
import { Company, Config } from 'src/app/shared/classes/company';
import { titleLine } from 'src/app/shared/interfaces/tailwind-class';
@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  standalone: true,
  imports: [
    RouterLink,
    FormComponent,
    CarouselModule,
    NgClass, NgStyle,
    TitleCasePipe, UpperCasePipe, LowerCasePipe,
  ]
})
export default class CompanyComponent implements OnInit, OnDestroy {

  public data: Company;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configSrv = inject(ConfigService);
  private companySrv = inject(CompanyService);

  public companyFullData: any = null;

  // carousel's configuration
  public customOptions: OwlOptions = {
    loop: true,
    rewind: true,
    mouseDrag: true,
    touchDrag: true,
    autoplay: true,
    autoplayTimeout: 3000,
    pullDrag: true,
    navSpeed: 700,
    autoHeight: false,
    autoWidth: false,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 2 },
      750: { items: 5 },
    },
  } 

  public customOptionsBeneficios: OwlOptions = {
    loop: true,
    rewind: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    navSpeed: 700,
    nav: true,       
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>'
    ],           
    dots: false,                
    autoplay: false,            
    responsive: {
      0: { items: 1.1 },      // 1 tarjeta + parte de otra
      600: { items: 2.3 },    // más ancho
      1000: { items: 2.6 },     // 3 total
      1200: { items: 3.1 },
      1600: { items: 3.5 },
    }
  }

  protected titleLine = titleLine;

  ngOnInit(): void {
    this.getData();
  }

  private getData() {
    //const key_name: string = this.route.snapshot.paramMap.get('key_name') || '';
    const key_name: string = 'medicus';

    this.companySrv.getOne(key_name)
      .subscribe(data => {
        if (data) {
          this.data = data;
          this.configPage(data.config);
          //this.router.navigate(['/']);

          this.companySrv.getCompanyDataAll(data.companyId).subscribe(fullData => {
            if (fullData) {
              this.companyFullData = fullData;
              if(this.companyFullData.company_form_sellers != null && this.companyFullData.company_form_sellers != '')
              {
                this.data.company_form_sellers = this.companyFullData.company_form_sellers;
              }else{
                this.data.company_form_sellers = 'fabien@elegimejor.com';
              }
              // console.log('>>>> ', this.companyFullData);
            }
          });
        }
      });
  }

  private configPage(config: Config) {
    this.configSrv.createLinkForCanonicalURL();
    this.configSrv.removeSchema('HomeSchema');
    this.configSrv.setTitle(config.title);

    
    config.meta.forEach(item => {
      //item.toAdd ? this.configSrv.addTag(item) : this.configSrv.setTag(item);
      this.configSrv.addTag(item);
    });
  }

  public scrollTop() {
    //const path = ['/company/' + this.data.key_name];
    const path = ['/'];
    this.router.navigate(path, { fragment: '' });

    // Refresco url para que usuario pueda volvear a scrollear si hace click en el boton rosita
    setTimeout(() => { this.router.navigate(path); }, 0);
  }

  ngOnDestroy(): void {
    this.companySrv.removeCurrent();
  }
}
