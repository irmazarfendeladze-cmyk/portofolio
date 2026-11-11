import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageCode, LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  readonly navigation = [
    { href: '#home', labelKey: 'nav.home' },
    { href: '#about', labelKey: 'nav.about' },
    { href: '#services', labelKey: 'nav.services' },
    { href: '#skills', labelKey: 'nav.skills' },
    { href: '#projects', labelKey: 'nav.projects' },
    { href: '#contact', labelKey: 'nav.contact' }
  ];

  readonly languageOptions: Array<{ code: LanguageCode; label: string }> = [
    { code: 'ka', label: 'KA' },
    { code: 'en', label: 'EN' },
    { code: 'it', label: 'IT' }
  ];

  isMenuOpen = false;

  constructor(readonly languageService: LanguageService) {}

  get cvFileName(): string {
    const language = this.languageService.currentLanguage;
    return `Irma-Endeladze-CV${language === 'en' ? '' : `-${language}`}.pdf`;
  }

  changeLanguage(language: LanguageCode): void {
    this.languageService.switchLanguage(language);
    this.closeMenu();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
      this.element.nativeElement.querySelector<HTMLButtonElement>('.nav-toggle')?.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }
}
