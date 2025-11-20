import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public data: { status: boolean, title: string, message: string };

  public add(status: boolean, title?: string, message?: string,  repeated?: boolean) {
    if (status) {
      title = title ? title : 'PETICIÓN ENVIADA';
      message = message ? message : 'Su petición ha sido enviada correctamente, en breves momentos nos pondremos en contacto con usted';
    }
    else if (repeated) {
      title = title ? title : 'PETICIÓN REPETIDA';
      message = message ? message : 'Hemos detectado que ya realizó una petición. Un vendedor se comunicará con usted.';
    }
    else {
      title = title ? title : 'Lo sentimos';
      message = message ? message : 'No recibimos su consulta. Inténtelo nuevamente, y si no lo logra, por favor comuníquese con nosotros al teléfono que esta disponible al final de la página.';
    }

    this.data = { status, title, message };
  }

  public remove() { this.data = null; }
}