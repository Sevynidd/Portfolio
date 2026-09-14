import { Component } from '@angular/core';

interface CvEntry {
  start: Date;
  end: Date | null;
  company: string;
  title: string;
  description: string;
}

const MONTH_NAMES = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

@Component({
  selector: 'app-cv',
  standalone: true,
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css']
})
export class CvComponent {
  readonly berufserfahrung: CvEntry[] = [
    {
      start: new Date(2024, 6, 1),
      end: null,
      company: 'SP_Data GmbH',
      title: 'Full-Stack Softwaredeveloper',
      description: 'Zuständig für die Pflege und Weiterentwicklung der Personalabrechnungssoftware mit dem Schwerpunkt gesetzlicher Änderungen.',
    },
    {
      start: new Date(2021, 7, 1),
      end: new Date(2024, 5, 1),
      company: 'SP_Data GmbH',
      title: 'Ausbildung: Fachinformatiker Anwendungsentwicklung',
      description: 'Zuständig für die Pflege und Weiterentwicklung der Personalabrechnungs‑ und Zeitwirtschaftssoftware mit einem Fokus auf der Umsetzung gesetzlicher Änderungen.',
    },
  ];

  readonly schulausbildung: CvEntry[] = [
    {
      start: new Date(2018, 7, 1),
      end: new Date(2021, 5, 1),
      company: 'August-Griese-Berufskolleg',
      title: 'Allgemeine Hochschulreife: Schwerpunkt Informatik',
      description: 'Abitur mit Schwerpunkt auf Informatik und Mathematik, einschließlich vertiefter Kenntnisse in Technischer Informatik (Datenbanken, Betriebssysteme/Netzwerke, Mikrocontrollertechnik) und Elektrotechnik.',
    },
  ];

  formatRange(entry: CvEntry): string {
    const start = `${MONTH_NAMES[entry.start.getMonth()]} ${entry.start.getFullYear()}`;
    const end = entry.end ? `${MONTH_NAMES[entry.end.getMonth()]} ${entry.end.getFullYear()}` : 'Heute';
    return `${start} — ${end}`;
  }

  formatDuration(entry: CvEntry): string {
    const end = entry.end ?? new Date();
    const totalMonths =
      (end.getFullYear() - entry.start.getFullYear()) * 12 +
      (end.getMonth() - entry.start.getMonth()) +
      1;

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const parts: string[] = [];
    if (years > 0) parts.push(years === 1 ? '1 Jahr' : `${years} Jahre`);
    if (months > 0) parts.push(months === 1 ? '1 Monat' : `${months} Monate`);
    return parts.join(', ');
  }
}
