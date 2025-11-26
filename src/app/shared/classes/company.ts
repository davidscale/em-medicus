export class ValidAge {
  max: number;
  min: number;
}

export class Content {
  title: string;
  img: string;
}

export class Config {
  title: string;
  meta: [{ name: string, content: string, toAdd: boolean }]
}

export class FullContent extends Content {
  subtitle: string;
}

export class Sanatorio {
  name: string;
}

export class SanatorioUnico {
  title: string;
  description: string;
  image: string;
}

export class Plan {
  title: { data: string, title_plan:string, description:string, color: string, background: string, image: string, image_header: string }
  benefits: { title: string; }[];
  theme: 'latest' | 'old' = 'old';
}

export class Company {
  companyId: number;
  company_form_sellers: string;
  key_name: string;
  name: string;
  discount?: number;
  color_primary: string;
  color_primary_dark: string;
  color_secundary: string;
  background: string;
  background_any: boolean;
  residences: { id: number, name: string, code: string }[];
  content: string;
  valid_age: ValidAge;
  config: Config;
  needs: FullContent[];
  benefits: FullContent[];
  sanatorios: Sanatorio[];
  sanatorio_unico?: SanatorioUnico[];
  plans: Plan[];
}
