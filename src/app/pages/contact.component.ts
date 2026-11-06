import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  constructor() {
    inject(SeoService).update({
      title: 'Kontakt',
      description: 'Interesse an einer Zusammenarbeit oder eine Frage? Kontaktiere Karina Kock direkt über das Kontaktformular.',
      path: '/contact'
    });
  }

  readonly inquiryTypes = ['Jobangebot', 'Projekt / Kollaboration', 'Frage', 'Sonstiges'];

  /** CSS modifier per inquiry type, used for the GitHub-style label colours. */
  readonly labelKeys: Record<string, string> = {
    'Jobangebot': 'job',
    'Projekt / Kollaboration': 'project',
    'Frage': 'question',
    'Sonstiges': 'other'
  };

  /** Write / preview tab of the message editor. */
  readonly tab = signal<'write' | 'preview'>('write');

  model = this.emptyModel();
  status = signal<'idle' | 'sending' | 'success' | 'error'>('idle');

  private readonly web3formsAccessKey = '61c35104-e0aa-4584-a311-0fb68c323610';

  private emptyModel() {
    return { subject: '', name: '', email: '', phone: '', inquiryType: this.inquiryTypes[0], message: '' };
  }

  /** Subject line of the resulting e-mail, also shown in the preview. */
  mailSubject(): string {
    const subject = this.model.subject.trim();
    return `Kontakt via Portfolio — ${this.model.inquiryType}${subject ? ': ' + subject : ''}`;
  }

  async onSubmit(form: NgForm) {
    if (form.invalid || !this.model.name.trim() || !this.model.email.trim() || !this.model.message.trim()) {
      form.form.markAllAsTouched();
      return;
    }

    this.status.set('sending');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: this.web3formsAccessKey,
          subject: this.mailSubject(),
          name: this.model.name,
          email: this.model.email,
          phone: this.model.phone,
          inquiryType: this.model.inquiryType,
          message: this.model.message,
        }),
      });
      const result = await response.json();
      this.status.set(result.success ? 'success' : 'error');
      if (result.success) {
        this.model = this.emptyModel();
        form.resetForm({ inquiryType: this.inquiryTypes[0] });
        this.tab.set('write');
      }
    } catch {
      this.status.set('error');
    }
  }
}
