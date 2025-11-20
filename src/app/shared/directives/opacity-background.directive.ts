import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appOpacityBackground]',
  standalone: true
})
export class OpacityBackgroundDirective implements OnInit {

  private el = inject(ElementRef);

  @Input('appOpacityBackground') color: string;
  @Input() opacity: number;

  ngOnInit() {
    this.el.nativeElement.style.backgroundColor = `rgba(${this.hexToRgb(this.color)}, ${this.opacity / 100})`;
  }

  hexToRgb(hex: string) {
    // Elimina el # si está presente
    hex = hex.replace(/^#/, '');

    // Parsea el valor en componentes RGB
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r},${g},${b}`;
  }
}
