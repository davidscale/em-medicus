import { Component, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-thanks',
  templateUrl: './thanks.component.html',
  standalone: true,
  imports: [RouterLink]
})
export default class ThanksComponent {
  platformId = inject(PLATFORM_ID);
}
