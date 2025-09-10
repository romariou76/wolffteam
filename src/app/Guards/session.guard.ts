import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth.service';

export const sessionGuard: CanActivateFn = (route, state) => {

  let session = inject(AuthService);
  let router = inject(Router);

  let resp = session.esTokenValido();
  if (resp == true) {
    return router.navigate(['plataforma']).then(() => false);
  }

  else {
    return true;
  }
};
