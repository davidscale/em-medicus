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

  protected countries = [
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },  
    { name: 'Chile', code: '+56', flag: '🇨🇱' },      
    { name: 'Uruguay', code: '+598', flag: '🇺🇾' },   
    { name: 'Brasil', code: '+55', flag: '🇧🇷' },     
    { name: 'México', code: '+52', flag: '🇲🇽' },     
    { name: 'España', code: '+34', flag: '🇪🇸' },
    { name: 'Perú', code: '+51', flag: '🇵🇪' },
    { name: 'Bolivia', code: '+591', flag: '🇧🇴' },
    { name: 'Venezuela', code: '+58', flag: '🇻🇪' },
    { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' }
  ];

  protected childrens = [...Array(10).keys()];

  protected inputClass = inputClass;
  protected labelClass = labelClass;

  ngOnInit(): void {
    this.getAllResidences();
    this.buildFormOnce();
    this.applyValidatorsByTab(); // arranca en Personas
  }

  public changeForm() {
    this.isPersonal = !this.isPersonal;
    this.applyValidatorsByTab();

    // opcional UX: no arrastrar estados visuales
    this.companyForm.markAsPristine();
    this.companyForm.markAsUntouched();
  }


  protected async onSubmit() {
    if (!this.checkForm()) { return; }

    const form: CompanyForm = this.companyForm.value;

    const country = this.companyForm.get('countryCode')?.value;
    const phone = this.companyForm.get('phone')?.value;
    let crmPhone = null;
    // limpiamos número
    let digits = phone.replace(/\D/g, '');
    // quitar todos los ceros iniciales
    digits = digits.replace(/^0+/, '');
    // concatenado final
    if(country == '+54') {
      let line = digits.slice(-4);        // últimos 4
      let prefix = digits.slice(-8, -4);  // 4 anteriores
      let area = digits.slice(0, -8);
      if(area == '15' || area == '11') //Verifico si es buenos aires o el interior
      {
        crmPhone = `+54(911)${prefix}-${line}`;
      }else{
        crmPhone = `+54(9${area})${prefix}-${line}`;
      }
       //guardo el formato especial del telefono para el crm de medicus
      form.phone = `+54911${prefix}${line}`;
    } else {
      form.phone = `${country}${digits}`;
      crmPhone = `${country}${digits}`; //guardo el formato especial del telefono para el crm de medicus
    }    
    //console.log(form.phone);
    //return false;

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
 
            this.enviarCRMMedicus(data['response'].item, crmPhone);
            this.router.navigateByUrl(baseUrl); 
          },
          err => { throw err; }
        )
      }
      else {     
        
        //residencia dato desde base
        let residencyName: any;
        try {
          residencyName = await firstValueFrom(
            this.companySrv.getResidenceById(form.residency)
          );
        } catch (error) {
          console.error('Error en la API residencia', error);
          this.notificationSrv.add(false);
          return;
        } 
        form.company_residency = residencyName.response.name;

        // console.log('city', form.company_residency);
        //I send the name of residency, not ID when is a company form 
        // form.company_residency = this.company.residences[form.residency -1].name; 
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
  async enviarCRMMedicus(data:any, crmPhone:string) 
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
          'phone': crmPhone,
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

  private buildFormOnce() {
    this.companyForm = this.fb.group({
    // comunes
    residency: [null],
    firstName: [null],
    phone: [null],
    email: [null],
    countryCode: ['+54'], // nuevo para telefonos

    // personas
    age: [null],
    family: [null],
    spouseAge: [null],
    numberOfChildren: [null],
    type: [null],
    contactByPhone: ['no'],

    // empresas
    razonSocialEmp: [null],
    cuitEmp: [null],
    employees: [null],
  });
}

  private applyValidatorsByTab() {
    const required = Validators.required;

    const nameValidators = [required, Validators.minLength(2), Validators.maxLength(50)];
    const razonSocialValidators = [required, Validators.minLength(2), Validators.maxLength(100)];
    const cuitValidators = [required, Validators.pattern(/^\d{11}$/)];
    const emailValidators = [required, Validators.email];

    const phoneValidators: ValidatorFn = (control: AbstractControl) => {
      if (!control.value) return null;
      const raw = control.value.toString().trim();

      if (!/^\+?\d+$/.test(raw)) return { invalidFormat: true };

      const digits = raw.replace(/\D/g, '');
      if (digits.length < 10) return { tooShort: true };
      if (digits.length > 15) return { tooLong: true };
      return null;
    };

    const set = (name: string, validators: any[]) => {
      const c = this.companyForm.get(name);
      c?.setValidators(validators);
      c?.updateValueAndValidity({ emitEvent: false });
    };

    const clear = (name: string) => {
      const c = this.companyForm.get(name);
      c?.clearValidators();
      c?.updateValueAndValidity({ emitEvent: false });
    };

    // Siempre válidos en ambas solapas
    set('firstName', nameValidators);
    set('phone', [required, phoneValidators]);
    set('residency', [required]);

    if (this.isPersonal) {
      // PERSONAS: activos
      set('age', [required, Validators.min(this.company.valid_age.min), Validators.max(this.company.valid_age.max)]);
      set('family', [required]);
      set('type', [required]);
      set('contactByPhone', [required]);

      // PERSONAS condicionales (se manejan con onFamily)
      clear('spouseAge');
      clear('numberOfChildren');

      // EMPRESAS: apagados
      clear('razonSocialEmp');
      clear('cuitEmp');
      clear('employees');
      clear('email');

      this.companyForm.get('email')?.setValue(null, { emitEvent: false });
      this.companyForm.get('employees')?.setValue(null, { emitEvent: false });

    } else {
      // EMPRESAS: activos
      set('razonSocialEmp', razonSocialValidators);
      set('cuitEmp', cuitValidators);
      set('email', emailValidators);
      set('employees', [required]);

      // PERSONAS: apagados
      clear('age');
      clear('family');
      clear('spouseAge');
      clear('numberOfChildren');
      clear('type');
      clear('contactByPhone');

      // valores que no aplican
      this.companyForm.get('contactByPhone')?.setValue('no', { emitEvent: false });
    }
  }
}
