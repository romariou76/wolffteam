import { inject, Injectable } from '@angular/core';
import { ProductoPut } from '../Interfaces/Producto';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CargoPut } from '../Interfaces/Vendedor/Cargo';
import { TipoDocumentoIdentidadPost, TipoDocumentoIdentidadPut } from '../Interfaces/Global/TipoDocumentoIdentidad';
import { FormaPagoPut } from '../Interfaces/FormaPago';
import { environment } from '../Environments/Environment';
import { ClientePut } from '../Interfaces/Cliente/Cliente';
import { SuscripcionPut } from '../Interfaces/Suscripcion';

@Injectable({
  providedIn: 'root'
})
export class PutApiService {


  http = inject(HttpClient)
  session = inject(AuthService)

  constructor() { }

  private readonly url = environment.urlApi;

  Headers() {
    return new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.session.GetToken()
    );
  }

  putFormaPago(object: FormaPagoPut) {
    let headers = this.Headers();
    let url = this.url + "FormaPago"
    return this.http.put(url, object, { headers })
  }

  putTipoDocumentoIdentidad(object: TipoDocumentoIdentidadPut) {
    let headers = this.Headers();
    let url = this.url + "TipoDocumento";
    return this.http.put(url, object, { headers })
  }

  putCargo(object: CargoPut) {
    let headers = this.Headers();
    let url = this.url + "Cargo";
    return this.http.put(url, object, { headers })
  }

  putEstadoPlan(id: number, estado: boolean) {
    let headers = this.Headers();
    let url = this.url + 'Plan/estado?id=' + id;
    return this.http.put(url,estado, { headers })
  }

  putProducto(object: ProductoPut) {
    let headers = this.Headers();
    let url = this.url + "Producto";
    return this.http.put(url, object, { headers })
  }

  putCliente(object: ClientePut) {
    let headers = this.Headers();
    let url = this.url + "Cliente";
    return this.http.put(url, object, { headers })
  }

  putSuscripcion(object: SuscripcionPut) {
    let headers = this.Headers();
    let url = this.url + "Suscripcion";
    return this.http.put(url, object, { headers })
  }
}
