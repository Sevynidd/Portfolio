import { Routes } from '@angular/router';

import { AboutComponent } from './pages/about.component';
import { ContactComponent } from './pages/contact.component';
import { CvComponent } from './pages/cv.component';
import { HomeComponent } from './pages/home.component';
import { PageNotFoundComponent } from './pages/page-not-found.component';
import { ProjectsComponent } from './pages/projects.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'cv', component: CvComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: '**', component: PageNotFoundComponent },
];
