import { Component, Input, OnInit, inject } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

import { Company } from 'src/app/shared/classes/company';
import { CompanyForm } from 'src/app/shared/classes/companyForm';


import { MailService } from 'src/app/services/mail.service';
import { CompanyService } from 'src/app/services/company.service';
import { NotificationService } from 'src/app/common/notification/notification.service';
import { NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { inputClass, labelClass } from 'src/app/shared/interfaces/tailwind-class';
import { OpacityBackgroundDirective } from 'src/app/shared/directives/opacity-background.directive';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [NgTemplateOutlet, NgStyle, ReactiveFormsModule, OpacityBackgroundDirective, NgIf, NgFor]
})
export class FormComponent implements OnInit {

  @Input() company: Company;
  protected isPersonal: boolean = true;
  protected companyForm: UntypedFormGroup;
  residenciesOptions: { id: number; name: string }[] = [];
  loadingResidences = true;
  
  firstUrl = localStorage.getItem('FirstUrl');
  utm_source = localStorage.getItem('UTMSource');

  private mailSrv = inject(MailService);
  private fb = inject(UntypedFormBuilder);
  private companySrv = inject(CompanyService);
  private notificationSrv = inject(NotificationService);
  private router = inject(Router);

  protected affiliateTypes = [
    { id: 1, name: 'Particular', long: 'Como Particular' },
    { id: 2, name: 'Monotributista', long: 'Como Monotributista' },
    { id: 3, name: 'Relación de dependencia', long: 'En Relación de Dependencia' }
  ];

  protected familyTypes = [
    { id: 'Mi solo', name: 'Mí solo' },
    { id: 'Mí y mi pareja', name: 'Mí y mi pareja' },
    { id: 'Mí, mi pareja y mis hijos', name: 'Mí, mi pareja y mis hijos' },
    { id: 'Mí y mis hijos', name: 'Mí y mis hijos' }
  ];

  protected childrens = [...Array(10).keys()];

  protected inputClass = inputClass;
  protected labelClass = labelClass;

  ngOnInit(): void {
    this.getAllResidences();
    this.createForm();
  }

  // protected changeForm(isPersonal: boolean = true) {
  //   if (this.isPersonal != isPersonal) {
  //     this.isPersonal = !this.isPersonal;
  //     this.ngOnInit();
  //   }
  // }

  public changeForm() {
    this.isPersonal = !this.isPersonal;
    this.ngOnInit();
  }

  protected onSubmit() {
    if (!this.checkForm()) { return; }

    const form: CompanyForm = this.companyForm.value;

    form.companyId = this.company.companyId;
    form.companyName = this.company.name;
    form.first_url = this.firstUrl;
    form.utm_source = this.utm_source;

    try {
      let baseUrl = '/enviado?';
      baseUrl += 'tel=' + form.phone;

      if (this.isPersonal) {
        this.companySrv.onCompanyForm(form).subscribe(
          data => { 
            //console.log(data['response'].item);
            
            if(data['response'].repetido == true)
            {
              this.notificationSrv.add(false, '', '', true);; this.ngOnInit();
              return false; 
            }

            this.enviarCRMMedicus(data['response'].item);
            this.router.navigateByUrl(baseUrl); 
          },
          err => { throw err; }
        )
      }
      else {
        //I send the name of residency, not ID when is a company form
        form.company_residency = this.company.residences[form.residency].name;
        this.mailSrv.sendEmailToEM(form, this.company.company_form_sellers).subscribe(
          response => { this.router.navigate(['enviado']); },
          err => { throw err; }
        );
      }
    }
    catch (error) { this.notificationSrv.add(false); }
  }

  private checkForm(): boolean {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return false;
    }
    return true;
  }

  private createForm() {
    const required = Validators.required;

    const nameValidators = [required, Validators.maxLength(50), Validators.minLength(2)];
    const cuitValidators = [required, Validators.pattern(/^\d{11}$/)];
    const razonSocialEmpValidators = [required, Validators.maxLength(100), Validators.minLength(2)];
    // const phoneValidators = [required, Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/im)];
    // const phoneValidators = [required, Validators.pattern(/^\d{10}$/)];
    const emailValidators = [required, Validators.email];


    const phoneValidators: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const value = control.value?.toString().replace(/\D/g, ''); // elimina caracteres no numéricos
        if (!value) return null;

        if (value.length < 9) {
          return { tooShort: true };
        }

        if (value.length > 10) {
          return { tooLong: true };
        }

        return null;
      };

    if (this.isPersonal) {
      this.companyForm = this.fb.group({
        firstName: new UntypedFormControl(null, Validators.compose(nameValidators)),
        // phone: new UntypedFormControl(null, Validators.compose(phoneValidators)),
        phone: ['', [Validators.required, phoneValidators]],
        residency: new UntypedFormControl(null, Validators.compose([required])),
      });
    } else {
      this.companyForm = this.fb.group({
        razonSocialEmp: new UntypedFormControl(null, Validators.compose(razonSocialEmpValidators)),
        cuitEmp: new UntypedFormControl(null, Validators.compose(cuitValidators)),
        firstName: new UntypedFormControl(null, Validators.compose(nameValidators)),
        // phone: new UntypedFormControl(null, Validators.compose(phoneValidators)),
        phone: ['', [Validators.required, phoneValidators]],
        residency: new UntypedFormControl(null, Validators.compose([required])),
        email: new UntypedFormControl(null, Validators.compose(emailValidators)),
      });  
    }
   
    this.isPersonal ? this.addFormPersonal() : this.addFormCompany();
  }

  private addFormPersonal() {
    const required = Validators.required;
    const minAgeValidators = Validators.min(this.company.valid_age.min);
    const maxAgeValidators = Validators.max(this.company.valid_age.max);

    this.companyForm.addControl('age', new UntypedFormControl(null, Validators.compose([required, minAgeValidators, maxAgeValidators])));
    this.companyForm.addControl('family', new UntypedFormControl(null, Validators.compose([required])));
    this.companyForm.addControl('spouseAge', new UntypedFormControl(null, Validators.compose([])));
    this.companyForm.addControl('numberOfChildren', new UntypedFormControl(null, Validators.compose([])));
    this.companyForm.addControl('type', new UntypedFormControl(null, Validators.compose([required])));
  }

  private addFormCompany() {
    this.companyForm.addControl('employees', new UntypedFormControl(null, Validators.compose([Validators.required])));
  }

  protected onFamily(val: string) {
    const hasSpouse = [this.familyTypes[1].name, this.familyTypes[2].name].includes(val);
    const hasChildren = [this.familyTypes[2].name, this.familyTypes[3].name].includes(val);

    this.updateControl('spouseAge', hasSpouse);
    this.updateControl('numberOfChildren', hasChildren);
  }

  private updateControl(controlName: string, isRequired: boolean) {
    const control = this.companyForm.controls[controlName];
    control.setValidators(isRequired ? [Validators.required] : null);
    control.setValue(isRequired ? control.value : null);
    control.updateValueAndValidity();
  }

  /*
  * Función para enviar datos al CRM de Medicus
  */
  async enviarCRMMedicus(data:any) 
    {
      //console.log(data);
      //return false;
      let residencyName:any;
      //Obtengo nombre de la residencia
      try 
      {
        residencyName = await firstValueFrom(this.companySrv.getResidenceById(data.residency_id));
      } 
      catch (error) 
      {
        console.error('Error en la API', error);
      }
  
      let capitas:Number = 1;
      let affiliateDescription:string;
         
      if(data.spouse_age)
      {
        capitas = 2;
      }else{
        data.spouse_age = 0;
      }
      
      if(data.number_of_children)
      {
        capitas = Number(capitas) + Number(data.number_of_children);
      }else{
        data.number_of_children = 0;
      }
  
      switch(String(data.affiliate_type))
      {
        case "1": 
          affiliateDescription = 'como particular';
          break;
        case "2":
          affiliateDescription = 'como monotributista';
          break;
        case "3":
          affiliateDescription = 'en relación de dependencia';
          break;
        default:
          affiliateDescription = '';
      }
  
  
      let items = {
          'firstname': data.firstname,
          'phone': this.formatPhone(String(data.phone)),
          'id_formulario_em': data.id,
          'city': residencyName.response.name,
          'forma_de_contratacion': affiliateDescription,
          'edad': data.age,
          'edad_conyuge': data.spouse_age,
          'cant_hijos': Number(data.number_of_children),
          'campana':'Elegi_Mejor',
          'capitas_en_grupo':capitas
      }
      
      //console.log(items);
      //return true;
      this.companySrv.sendToCRMMedicus(items).subscribe({
                    next: (data) => {
                      console.log('Respuesta del CRM:', data);
                    },
                    error: (err: HttpErrorResponse) => {
                      console.error('Error al enviar a CRM:', err);
                      console.error('Status:', err.status);
                      console.error('Mensaje:', err.message);
                    }
          });
    }

    
    /*
    * Función para dar formato a los números de teléfono
    */

    formatPhone(phone: string, flag: boolean = false): string 
    {
      // 1. Limpiamos caracteres no numéricos
      let digits = phone.replace(/\D/g, '');
  
      // 2. Tomamos partes desde atrás hacia adelante
      let line = digits.slice(-4);        // últimos 4
      let prefix = digits.slice(-8, -4);  // 4 anteriores
      let areaCode = digits.slice(0, -8); // lo que sobra al principio
  
      // 3. Armamos el formato
      //Si flag está en true, arma el número de teléfono todo junto sin separadores
      if(flag)
      {
        return `+54 9 ${areaCode} ${prefix} ${line}`;
      }

      return `+54(9${areaCode})${prefix}-${line}`;
    }

    public getAllResidences(){
    
      this.companySrv.getAllResidences().subscribe({
          next: (data:any) => {
              this.residenciesOptions = data.response.map(x => ({
                  id: x.id,
                  name: x.name
                }));
                this.loadingResidences = false;
          },
          error: () => this.loadingResidences = false
      });
    }

}
