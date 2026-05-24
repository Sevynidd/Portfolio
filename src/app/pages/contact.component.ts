import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  model = { name: '', email: '', message: '' };

  onSubmit() {
    const to = 'maxmustermann@test.com';
    const subject = encodeURIComponent('Kontakt via Portfolio');
    const body = encodeURIComponent(`Name: ${this.model.name}\nEmail: ${this.model.email}\n\n${this.model.message}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }
}
