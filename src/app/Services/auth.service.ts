import { inject, Injectable, signal } from '@angular/core';
import { LoginDTO } from '../Interfaces/LoginDTO';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../Interfaces/Usuario';
import { UsuarioDTO } from '../Interfaces/UsuarioDTO';
import { AlertsService } from './alerts.service';
import { catchError, Observable } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';
import { environment } from '../Environments/Environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public readonly url = environment.urlApi;
  public readonly alertas = inject(AlertsService)

  Headers() {
    return new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.GetToken())
  }

  Login(user: LoginDTO) {
    let url = this.url + 'Auth';
    return this.http.post(url, user, { responseType: 'text' }).pipe(
      catchError((error) => {
        let err: Observable<string> = {} as Observable<string>;
        localStorage.removeItem('token');
        return err;
      })
    );
  }

  LoginVendedor(user: LoginDTO) {
    let url = this.url + 'Auth';
    return this.http.post(url, user, { responseType: 'text' }).pipe(
      catchError((error) => {
        let err: Observable<string> = {} as Observable<string>;
        localStorage.removeItem('token');
        return err;
      })
    );
  }

  GetToken(): string {
    const tok = localStorage.getItem('token');
    return tok ?? '';
  }

  esTokenValido(): boolean {
    try {
      const token = this.GetToken()
      if (!token) return false;

      jwtDecode(token);
      return true;
    } catch {
      return false;
    }
  }

  GetIdUsuario(){
    let token = this.GetToken()
    let decodedToken: any = jwtDecode(token);
    let id = decodedToken.Id;
    // this.idEmpleado.set(id)
    return id;
  }



//   esTokenValido(): boolean {
//   try {
//     const token = this.GetToken();
//     if (!token) return false;

//     jwtDecode(token);

//     return this.tokenNoExpirado(token);
//   } catch {
//     return false;
//   }
// }

// tokenNoExpirado(token: string): boolean {
//   try {
//     const payload: any = jwtDecode(token);
//     const now = Date.now() / 1000;

//     if (!payload.exp || payload.exp <= now) {
//       alert('Su sesión ha expirado. Será redirigido al inicio.');
//       setTimeout(() => {
//         localStorage.removeItem('token');
//         location.reload();
//       }, 2000);
//       return false;
//     }

//     return true;
//   } catch {
//     alert('Token inválido o expirado. Será redirigido al inicio.');
//     setTimeout(() => {
//       localStorage.removeItem('token');
//       location.reload();
//     }, 2000);
//     return false;
//   }
// }




















  obtenerIdUsuario() {
    let token = this.GetToken()
    let decodedToken: any = jwtDecode(token);
    let id = decodedToken.Id;
    return id;
  }

  isAdmin(): boolean | null {
    const token = this.GetToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.Cargo == 'ADMINISTRADOR') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async getUsuarioDTO() {
    // let token = this.obtenerToken()
    // let decodedToken: any = jwtDecode(token);
    // let id = decodedToken._id;
    // console.log(id)
    // let resp = await firstValueFrom(this.api.GetUserById(id));
    // this.usuario.set(resp)
    // if (resp != null){
    //   let userDto = {
    //     _id: resp._id,
    //     nombres: resp.nombre,
    //     documentoIdentidad: resp.documentoIdentidad,
    //     numeroIdentificacion: resp.numeroIdentificacion,
    //     brevete: resp.brevete,
    //     correo: resp.correo,
    //     telefono: resp.telefono,
    //     username: resp.username,
    //     rol: resp.rol,
    //   }
    // } else {
    //   alert("Se cerrara la sesion")
    //   this.forzarCerrarSesion()
    // }
  }

  getUsuarioByToken() {
    // let token = this.obtenerToken()
    // let decodedToken: UserToken = jwtDecode(token);
    // if (decodedToken != null){
    //   let userDto: UserDtoToken = {
    //     _id: decodedToken._id,
    //     nombre: decodedToken.nombre,
    //     apellidos: decodedToken.apellidos,
    //     documentoIdentidad: decodedToken.documentoIdentidad,
    //     numeroIdentificacion: decodedToken.numeroIdentificacion,
    //     brevete: decodedToken.brevete,
    //     correo: decodedToken.correo,
    //     telefono: decodedToken.telefono,
    //     username: decodedToken.username,
    //     rol_nombre: decodedToken.rol_nombre,
    //     rol_nivel: decodedToken.rol_nivel
    //   }
    //   this.userDtoToken.set(userDto)
    // } else {
    //   alert("Se cerrara la sesion")
    //   this.forzarCerrarSesion()
    // }
  }

  cerrarSesion() {
    Swal.fire({
      title: '¿Seguro que quieres cerrar la sesión?',
      text: 'Se cerrará la sesión actual y se desconectará.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sesión cerrada', 'La sesión ha sido cerrada correctamente.', 'success');
        localStorage.removeItem("token")
        setTimeout(function () {
          location.reload();
        }, 700);
      }
    });
  }

  forzarCerrarSesion() {
    this.alertas.alertaAdvertencia("Inicie Sesion")
    localStorage.removeItem("token")
    setTimeout(function () {
      location.reload();
    }, 200);
  }



}
