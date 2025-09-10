import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../Environments/Environment';

@Injectable({
  providedIn: 'root'
})
export class DeleteApiService {

  http = inject(HttpClient)
  session = inject(AuthService)

  constructor() { }

  Headers() {
    return new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.session.GetToken()
    );
  }

  private readonly url = environment.urlApi;

  DeleteUsuario(id: number) {
    let headers = this.Headers();
    let url = `${this.url + 'Usuario'}?id=${id}`;
    return this.http.delete(url, { headers, responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la petición HTTP:', error);
          return throwError(() => error);
        })
      );
  }


  DeleteProducto(id: number) {
    let headers = this.Headers();
    let url = `${this.url + 'Producto'}?id=${id}`;
    return this.http.delete(url, { headers, responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  DeleteCategoria(id: number) {
    let headers = this.Headers();
    let url = `${this.url + 'Utilidades/' + id}`;
    return this.http.delete(url, { headers, responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  deleteFormaPago(id: number) {
    let headers = this.Headers();
    // let url = this.url + 'FormaPago?idFormaPago=' + id;
    let url = this.url + 'FormaPago?id=' + id;
    return this.http.delete(url, { headers, responseType: 'text' })
  }

  deleteGenero(id: number) {
    let headers = this.Headers();
    // let url = this.url + 'FormaPago?idFormaPago=' + id;
    let url = this.url + 'Genero?id=' + id;
    return this.http.delete(url, { headers, responseType: 'text' })
  }


  deleteCargo(id: number) {
    let headers = this.Headers();
    // let url = this.url + 'FormaPago?idFormaPago=' + id;
    let url = this.url + 'Cargo?id=' + id;
    return this.http.delete(url, { headers, responseType: 'text' })
  }


  deleteTipoDocumentoIdentidad(id: number) {
    let headers = this.Headers();
    // let url = this.url + 'FormaPago?idFormaPago=' + id;
    let url = this.url + 'TipoDocumento?id=' + id;
    return this.http.delete(url, { headers, responseType: 'text' })
  }

}
