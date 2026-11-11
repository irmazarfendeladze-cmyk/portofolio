import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProjectCardComponent, ProjectCardItem } from '../../components/project-card/project-card';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export type ProjectFilter = 'all' | 'web' | 'ui' | 'ecommerce';

function trimmedMinLength(length: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) return { required: true };
    return value.length < length ? { minlength: { requiredLength: length, actualLength: value.length } } : null;
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, ProjectCardComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  readonly profileImage = 'assets/images/photo.png';

  readonly projectFilters: Array<{ value: ProjectFilter; labelKey: string }> = [
    { value: 'all', labelKey: 'projects.filters.all' },
    { value: 'web', labelKey: 'projects.filters.web' },
    { value: 'ui', labelKey: 'projects.filters.ui' },
    { value: 'ecommerce', labelKey: 'projects.filters.ecommerce' }
  ];

  readonly stats = [
    { value: '2+', labelKey: 'stats.years' },
    { value: '10+', labelKey: 'stats.projects' }
  ];

  readonly skills = [
    'skills.items.0',
    'skills.items.1',
    'skills.items.2',
    'skills.items.3',
    'skills.items.4',
    'skills.items.5',
    'skills.items.6',
    'skills.items.7',
    'skills.items.8',
    'skills.items.9',
    'skills.items.10'
  ];

  readonly services = [
    {
      titleKey: 'services.frontend.title',
      descriptionKey: 'services.frontend.description'
    },
    {
      titleKey: 'services.responsive.title',
      descriptionKey: 'services.responsive.description'
    }
  ];

  readonly aboutItems = [
    'about.items.0',
    'about.items.1',
    'about.items.2',
    'about.items.3',
    'about.items.4'
  ];

  readonly projects: ProjectCardItem[] = [
    {
      id: 'marmenio',
      category: 'web',
      href: 'https://irmazarfendeladze-cmyk.github.io/-3/',
      image: 'assets/images/projects/restaurant.webp',
      titleKey: 'projects.marmenio.title',
      descriptionKey: 'projects.marmenio.description',
      previewClass: 'restaurant',
      tech: ['HTML', 'CSS', 'JavaScript']
    },
    {
      id: 'marmenio2',
      category: 'ui',
      href: 'https://irmazarfendeladze-cmyk.github.io/Figma-Marmerino-2-/',
      image: 'assets/images/projects/marmenio.webp',
      titleKey: 'projects.marmenio2.title',
      descriptionKey: 'projects.marmenio2.description',
      previewClass: 'luxury',
      tech: ['HTML', 'CSS', 'Bootstrap']
    },
    {
      id: 'shop',
      category: 'ecommerce',
      href: 'https://onlineshop-ashy.vercel.app/',
      image: 'assets/images/projects/shop.webp',
      titleKey: 'projects.shop.title',
      descriptionKey: 'projects.shop.description',
      previewClass: 'shop',
      tech: ['Angular', 'TypeScript', 'SCSS']
    },
    {
      id: 'train-ticket',
      category: 'web',
      href: 'https://train-ticket2.vercel.app/search',
      image: 'assets/images/projects/train-ticket.webp',
      titleKey: 'projects.trainTicket.title',
      descriptionKey: 'projects.trainTicket.description',
      previewClass: 'placeholder',
      tech: ['Angular', 'TypeScript', 'CSS']
    }
  ];

  activeFilter = signal<ProjectFilter>('all');

  contactForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [trimmedMinLength(2)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    subject: new FormControl('', { nonNullable: true, validators: [trimmedMinLength(3)] }),
    message: new FormControl('', { nonNullable: true, validators: [trimmedMinLength(10)] })
  });

  formFeedback = '';
  emailDraft = '';

  constructor(readonly languageService: LanguageService) {
    this.contactForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.formFeedback = '';
      this.emailDraft = '';
    });
  }

  get filteredProjects(): ProjectCardItem[] {
    return this.activeFilter() === 'all'
      ? this.projects
      : this.projects.filter((project) => project.category === this.activeFilter());
  }

  setFilter(filter: ProjectFilter): void {
    this.activeFilter.set(filter);
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.emailDraft = '';
      this.formFeedback = 'contact.form.invalid';
      return;
    }

    const payload = this.contactForm.getRawValue();
    const body = `${this.languageService.translate('contact.form.name')}: ${payload.name.trim()}\n` +
      `${this.languageService.translate('contact.form.email')}: ${payload.email.trim()}\n\n${payload.message.trim()}`;
    this.emailDraft = `mailto:irma.zarf.endeladze@gmail.com?subject=${encodeURIComponent(payload.subject.trim())}&body=${encodeURIComponent(body)}`;
    this.formFeedback = 'contact.form.success';
  }
}
