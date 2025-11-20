import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TaggedTemplateExpr } from '@angular/compiler';
import { Company } from '../shared/classes/company';
import { CompanyForm } from '../shared/classes/companyForm';
import { companyData } from '../shared/classes/companyData';

@Injectable({
  providedIn: 'root'
})

export class CompanyService {
  private company$: BehaviorSubject<Company> = new BehaviorSubject<Company>(null);

  private http = inject(HttpClient);
  private router = inject(Router);

  /**
   * This method try to find in assets/json a file with same name of param
   * @param key_name
   * @returns
   */
  
  public getOne(key_name: string): Observable<Company> {
    const path = `/assets/jsons/${key_name}.json`;

    this.http.get(path)
      .subscribe(
        value => { this.setData(value as Company) },
        err => {
          if (err instanceof HttpErrorResponse) {
            this.onErr();
            console.error('Ocurrió un error en la petición HTTP:', err.message);
          }
        }
      );

    return this.getCurrent();
  }

  /**
   * This method check if user is in specifig page of any Company
   * If is in some page, return data about that Company, else null
   * @returns Company | null
   */
  public getCurrent(): Observable<Company> {
    return this.company$;
  }

  /**
   * This method remove data about current Company
   */
  public removeCurrent(): void {
    this.setData();
  }

  public onCompanyForm(form: CompanyForm): Observable<Object> {
    const url = environment.phpBaseUrl + 'company/send-form';

    const data = {
      company_id: form.companyId,
      firstname: form.firstName,
      lastname: '',
      //email: form.email,
      email: '',
      phone: form.phone,
      age: form.age,
      residency_id: +form.residency,
      locality_id: null,
      type: form.family,
      affiliateType: +form.type,
      spouseAge: +form.spouseAge,
      numberOfChildren: +form.numberOfChildren,
      cp: null,
      dni: null,
      first_url: form.first_url,
      fuente: form.utm_source
    };
    
    return this.http.post(url, data);
  }

  /**
   * This method update data about current Company
   */
  private setData(model: Company = null): void {
    if (model) {
      model.background = this.setBackground(model.background_any, model.key_name);
    }

    this.company$.next(model);
  }

  private setBackground(background_any: boolean, key_name: string) {
    let background = '/assets/images/company/';
    background += background_any ? 'any/background.webp' : `any/${key_name}.webp`;

    return background;
  }

  // Traigo TODO del back
  public getCompanyDataAll(companyId: number) {
    const url = environment.phpBaseUrl + 'admin/company?id=' + companyId;

    return this.http.get<any>(url).pipe(
      map(companyData => companyData ? companyData['response'] : null),
      catchError(() => of(null))
    );
  }
  
  public getCompanyData(companyId:number)
  {
    const url = environment.phpBaseUrl + 'admin/company?id=' + companyId;

    return this.http.get<companyData>(url)
    .pipe(
      map( companyData => companyData ? companyData['response'].whatsapp_number : null ),
      catchError( () => of(null) )
    )
  }

  private onErr(): void {
    this.setData();
    this.router.navigateByUrl(`/pagina-no-encontrada`)
  }

  public getResidenceById(id: number) {
    const url = environment.phpBaseUrl + 'residency/fetch';
    return this.http.get(`${url}`, {
        params: { id: id }
    });
  }

  // FUNCION PARA EL ENVIO DE DATOS AL CRM DE HOMINIS
  sendToCRMHominis(items:any):Observable<any> {
     return this.http.post(environment.phpBaseUrl + 'admin/sendhominiscrm', items);
  }

}
