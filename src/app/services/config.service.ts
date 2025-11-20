import { Injectable, Inject, inject } from '@angular/core';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private meta = inject(Meta);
  private title = inject(Title);
  private doc = inject(DOCUMENT);

  public setTitle(title: string): void {
    this.title.setTitle(title);
  }

  public addTag(tag: MetaDefinition | any): HTMLMetaElement {
    return this.meta.addTag(tag);
  }

  public setTag(tag: MetaDefinition | any): void {
    this.meta.updateTag(tag);
  }

  public removeTag(attrSelector: string): void {
    this.meta.removeTag(attrSelector);
  }

  public removeSchema(id: string) {
    const doc = this.doc.getElementById(id);
    if (doc) { doc.remove(); }
  }

  public createLinkForCanonicalURL() {
    let rel = this.doc.querySelectorAll('[rel="canonical"]');

    if (rel[0]) {
      rel[0].setAttribute('href', 'https://hominis.elegimejor.com.ar' + this.doc.location.pathname);
    } else {
      let link: HTMLLinkElement = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
      link.setAttribute('href', 'https://hominis.elegimejor.com.ar' + this.doc.location.pathname);
    }
  }
}
