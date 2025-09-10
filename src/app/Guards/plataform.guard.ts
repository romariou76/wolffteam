import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const plataformGuard: CanActivateFn = (route, state) => {
  let session = inject(AuthService)
  let rout = inject(Router)
  let verif = session.esTokenValido()
  if(verif == true){
    return true
  }else if(verif == false){
    return rout.navigate(['login']).then(() => false)
  }else{
    return rout.navigate(['login']).then(() => false)
  }
};
