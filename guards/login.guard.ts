import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import { LoginClientService } from '@/core/services/login/login-client.service';

export const loginGuard: CanActivateFn = (route, state) => {
  let loginClient = inject(LoginClientService);
  let router = inject(Router);
  if (!loginClient.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  return true;
};
