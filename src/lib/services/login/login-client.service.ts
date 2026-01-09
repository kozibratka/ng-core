import { Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import {SymfonyApiClientService} from '../api/symfony-api-client.service';
import {map, switchMap, tap} from 'rxjs/operators';
import {TokenInterface} from './interfaces/token-interface';
import {Observable, of} from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginClientService {

  constructor(
    private symfonyApiClient: SymfonyApiClientService,
  ) {
  }

  tryLogin(loginData: {}, path = 'login_token'): Observable<HttpResponse<TokenInterface>> {
    return this.symfonyApiClient.refreshToken(loginData, path);
  }

  isLoggedIn(): boolean | null {
    const decoded = this.decodeAccessToken(this.symfonyApiClient.token);
    if (!decoded) {
      return null;
    }
    if (new Date(decoded.exp * 1000) < new Date()) {
      return false;
    }
    return true;
  }

  logout(): void {
      if (localStorage.getItem('originToken')) {
          localStorage.removeItem('originToken');
      }
    this.symfonyApiClient.logout();
  }

  decodeAccessToken(token: string | null): {exp: number} | null {
    try {
      return token && jwtDecode(token) as any;
    } catch (Error) {
      return null;
    }
  }

    impersonation(id: string) {
        if (id && this.isLoggedIn()) {
            let origin = this.symfonyApiClient.token as string;
            return this.tryLogin({id}, 'login_relogin').pipe(tap(response => {
                localStorage.setItem('originToken', origin);
            }));
        }
        return null;
    }

    removeImpersonation() {
      if (this.isImpersonation()) {
          this.symfonyApiClient.token = localStorage.getItem('originToken') as string;
          localStorage.removeItem('originToken');
      }
    }

    isImpersonation(): boolean {
        return !!localStorage.getItem('originToken');
    }
}
