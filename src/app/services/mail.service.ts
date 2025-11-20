import { Injectable, inject } from '@angular/core';

//import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
//import { init } from "emailjs-com";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { CompanyForm } from '../shared/classes/companyForm';
//init("user_CK2ZPMj0FfV6wbMKMOi4k");

@Injectable({
  providedIn: 'root'
})

export class MailService {

  private http = inject(HttpClient);
  
  private emailCopia = 'contacto@elegimejor.com';
  //private vendedorEmail = 'canalesdigitales@hominis.com.ar';
  

  public sendEmail(data: any): Observable<Object> {
    const url = environment.phpBaseUrl + 'landing/send-mail';
    return this.http.post(url, data);
  }

  public sendEmailToEM(form: CompanyForm, sellers_email: string) {
    const details: string = `
      Interesado: ${form.firstName}<br>
      Teléfono: ${form.phone}<br>
      Cantidad de Empleados: ${form.employees}<br>
      Residencia: ${form.company_residency}<br>`;

    const data = {
      to: sellers_email,
      cc: this.emailCopia,
      from: 'info@elegimejor.com',
      subject: `Información sobre ${form.companyName}`,
      text: 'Una ' + (form.employees ? 'Empresa' : 'Persona') + ` tiene interés en ${form.companyName}.<br><br>${details}`,
    };

    return this.sendEmail(data);
  }
}
