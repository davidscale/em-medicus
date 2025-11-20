export class CompanyForm {
  companyId: number;
  companyName: string;

  firstName: string;
  secondName: string;
  phone: string;
  email: string;
  residency: number;
  company_residency: string;

  // Only in Personal
  age: number | null;
  family: string | null;
  spouseAge: number | null;
  numberOfChildren: number | null;
  type: number | null;

  // Only in Private
  employees: string | null;
  razonSocialEmp: string;
  cuitEmp: number;

   // EM data of Interest
   first_url: string | null;
   utm_source: string | null;
}
