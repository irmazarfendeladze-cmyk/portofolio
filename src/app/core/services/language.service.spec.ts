import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../app';
import { routes } from '../../app.routes';
import { LanguageCode, LanguageService } from './language.service';
import ka from '../../../assets/i18n/ka.json';
import en from '../../../assets/i18n/en.json';
import italian from '../../../assets/i18n/it.json';

describe('Language switching', () => {
  const dictionaries = { ka, en, it: italian };

  beforeEach(() => {
    localStorage.removeItem('irma-language');
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem('irma-language');
  });

  it('translates the routed page, existing validation feedback and metadata in all three languages', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const service = TestBed.inject(LanguageService);
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    for (const language of ['en', 'it', 'ka'] as LanguageCode[]) {
      service.switchLanguage(language);
      await fixture.whenStable();
      const expected = dictionaries[language];
      expect(page.querySelector('h1')?.textContent).toBe(expected.hero.title);
      expect(page.querySelector('.brand')?.textContent).toBe(expected.header.logo);
      const cvFilename = `Irma-Endeladze-CV${language === 'en' ? '' : `-${language}`}.pdf`;
      const cvLink = page.querySelector<HTMLAnchorElement>('a.download-button');
      expect(cvLink?.getAttribute('href')).toBe(`assets/files/${cvFilename}`);
      expect(cvLink?.getAttribute('download')).toBe(cvFilename);
      expect(cvLink?.textContent?.trim()).toBe(expected.header.cv);
      expect(page.querySelector('.footer-socials a')?.textContent?.trim()).toBe(expected.contact.emailLabel);
      expect(page.querySelector('.form-feedback')?.textContent).toBe(expected.contact.form.invalid);
      expect(page.querySelectorAll('.project-badge')[1].textContent).toBe(expected.projects.filters.ui);
      expect(document.documentElement.lang).toBe(language);
      expect(document.title).toBe(`${expected.footer.title} | ${expected.footer.role}`);
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(expected.hero.description);
      expect(localStorage.getItem('irma-language')).toBe(language);
      expect(page.textContent).not.toMatch(/\b(?:hero|contact|projects|nav|header|footer)\.[a-z]/);
    }
  });

  it('uses the saved language on startup without an HTTP request', () => {
    localStorage.setItem('irma-language', 'it');
    const service = TestBed.inject(LanguageService);
    expect(service.currentLanguage).toBe('it');
    expect(service.translate('hero.title')).toBe(italian.hero.title);
  });

  it('continues to switch languages when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked'); });
    const service = TestBed.inject(LanguageService);
    expect(service.currentLanguage).toBe('ka');
    service.switchLanguage('en');
    expect(service.translate('hero.title')).toBe(en.hero.title);
  });
});
