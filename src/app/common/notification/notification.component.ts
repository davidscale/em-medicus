import { Component, inject } from '@angular/core';
import { NotificationService } from 'src/app/common/notification/notification.service';
import { OpacityBackgroundDirective } from 'src/app/shared/directives/opacity-background.directive';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  standalone: true,
  imports: [OpacityBackgroundDirective]
})
export class NotificationComponent {
  notiSrv = inject(NotificationService);

  public remove() {
    this.notiSrv.remove();
  }
}
