import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  readonly inquiryTypes = ['Jobangebot', 'Projekt / Kollaboration', 'Frage', 'Sonstiges'];

  model = { name: '', email: '', phone: '', inquiryType: this.inquiryTypes[0], message: '' };
  status = signal<'idle' | 'sending' | 'success' | 'error'>('idle');

  private readonly web3formsAccessKey = '61c35104-e0aa-4584-a311-0fb68c323610';

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
          subject: `Kontakt via Portfolio — ${this.model.inquiryType}`,
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
        this.model = { name: '', email: '', phone: '', inquiryType: this.inquiryTypes[0], message: '' };
        form.resetForm({ inquiryType: this.inquiryTypes[0] });
      }
    } catch {
      this.status.set('error');
    }
  }
}
