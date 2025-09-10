import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth.service';

export const permisosGuard: CanActivateFn = (route, state) => {
  let session = inject(AuthService)
  let rout = inject(Router)
  let isAdmin = session.isAdmin()
  if(isAdmin == true){
    return true;
  } else {
    return rout.navigate(['plataforma/control-ingreso']).then(() => false)
  }

};
