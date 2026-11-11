import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home';

describe('Portfolio interactions', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HomeComponent], providers: [provideRouter([])] }));

  it('shows four working projects with preview images and filters the cards', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('app-project-card')).toHaveLength(4);
    expect(page.querySelectorAll('.project-link')).toHaveLength(4);
    expect(page.querySelectorAll('.project-preview img')).toHaveLength(4);
    page.querySelectorAll<HTMLButtonElement>('.project-filters button')[3].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('app-project-card')).toHaveLength(1);
    expect(page.querySelector('.project-link')?.getAttribute('href')).toBe('https://onlineshop-ashy.vercel.app/');
    page.querySelectorAll<HTMLButtonElement>('.project-filters button')[1].click();
    await fixture.whenStable();
    expect(page.querySelectorAll('app-project-card')).toHaveLength(2);
    expect(page.querySelector('a[href="https://train-ticket2.vercel.app/search"]')).toBeTruthy();
  });

  it('rejects whitespace-only fields and keeps entered values', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const home = fixture.componentInstance;
    home.contactForm.setValue({ name: '  ', email: 'irma@example.com', subject: '   ', message: '          ' });
    home.onSubmit();
    expect(home.contactForm.invalid).toBe(true);
    expect(home.emailDraft).toBe('');
    expect(home.contactForm.controls.name.value).toBe('  ');
  });

  it('prepares an encoded email draft without discarding the message and clears stale drafts on editing', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const home = fixture.componentInstance;
    const value = { name: ' Irma ', email: 'irma@example.com', subject: 'Hello & გამარჯობა', message: 'A message with ? & # and Georgian: გამარჯობა' };
    home.contactForm.setValue(value);
    home.onSubmit();
    const draft = new URL(home.emailDraft);
    expect(draft.protocol).toBe('mailto:');
    expect(draft.pathname).toBe('irma.zarf.endeladze@gmail.com');
    expect(draft.searchParams.get('subject')).toBe(value.subject);
    expect(draft.searchParams.get('body')).toContain(value.message);
    expect(draft.searchParams.get('body')).toContain(value.email);
    expect(home.contactForm.getRawValue()).toEqual(value);
    home.contactForm.controls.message.setValue('Updated message');
    expect(home.emailDraft).toBe('');
    expect(home.formFeedback).toBe('');
  });
});
