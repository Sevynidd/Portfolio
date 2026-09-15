import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay } from 'rxjs';

export interface GithubProfile {
  login: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
}

export interface GithubRepo {
  name: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
}

export interface GithubData {
  profile: GithubProfile;
  repos: GithubRepo[];
}

interface GithubApiUser {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
}

interface GithubApiRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
}

const GITHUB_USERNAME = 'Sevynidd';
const API_BASE = 'https://api.github.com';
const MAX_REPOS_SHOWN = 4;

@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly http = inject(HttpClient);

  // Cached for the lifetime of the app — GitHub's unauthenticated API is rate-limited to 60 req/h/IP.
  private readonly data$: Observable<GithubData | null> = forkJoin({
    profile: this.http.get<GithubApiUser>(`${API_BASE}/users/${GITHUB_USERNAME}`),
    repos: this.http.get<GithubApiRepo[]>(`${API_BASE}/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`)
  }).pipe(
    map(({ profile, repos }) => ({
      profile: {
        login: profile.login,
        htmlUrl: profile.html_url,
        publicRepos: profile.public_repos,
        followers: profile.followers
      },
      repos: repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
        .slice(0, MAX_REPOS_SHOWN)
        .map((repo) => ({
          name: repo.name,
          htmlUrl: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count
        }))
    })),
    catchError(() => of(null)),
    shareReplay(1)
  );

  getData(): Observable<GithubData | null> {
    return this.data$;
  }
}
