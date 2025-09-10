import { inject, Injectable } from '@angular/core';
import { Producto, ProductoPost } from '../Interfaces/Producto';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Usuario, UsuarioPost } from '../Interfaces/Usuario';
import { Vendedor, VendedorPost } from '../Interfaces/Vendedor/Vendedor';
import { TipoDocumentoIdentidad, TipoDocumentoIdentidadPost } from '../Interfaces/Global/TipoDocumentoIdentidad';
import { Cargo, CargoPost } from '../Interfaces/Vendedor/Cargo';
import { FormaPago, FormaPagoPost } from '../Interfaces/FormaPago';
import { environment } from '../Environments/Environment';
import { Cliente, ClientePost } from '../Interfaces/Cliente/Cliente';
import { Plan, PlanPost } from '../Interfaces/Plan';
import { ReporteInscripcionBusqueda, Suscripcion, SuscripcionPost } from '../Interfaces/Suscripcion';
import { Pago, PagoMovimientoBusqueda, PagoPost, ReportePagoBusqueda } from '../Interfaces/Pago';
import { ReporteVenta, ReporteVentaBusqueda, Venta, VentaDetalles, VentaPost } from '../Interfaces/Gestion/Venta';
import { Visita, VisitaPost } from '../Interfaces/Gestion/Visita';
import { PrecioIngreso, PrecioIngresoPost } from '../Interfaces/Gestion/PrecioIngreso';
import { TopProductosVendidos } from '../Interfaces/Dashboard/TopProductosVendidos';

@Injectable({
  providedIn: 'root'
})
export class PostApiService {

  constructor(private http: HttpClient) { }
  session = inject(AuthService)


  Headers() {
    return new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.session.GetToken()
    );
  }

  url = environment.urlApi;

  postProducto(obj: ProductoPost): Observable<Producto> {
    let headers = this.Headers();
    let url = this.url + 'Producto';
    return this.http
      .post<Producto>(url, obj, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  // postRecibo(tipo: ReciboPost): Observable<Recibo> {
  //   let headers = this.Headers();
  //   let url = this.url + 'Recibo';
  //   return this.http
  //     .post<Recibo>(url, tipo, { headers })
  //     .pipe(
  //       catchError((error: HttpErrorResponse) => {
  //         console.error('Error en la petición HTTP:', error);
  //         return throwError(() => error);
  //       })
  //     );
  // }



  postTipoDocumentoIdentidad(object: TipoDocumentoIdentidadPost) {
    let headers = this.Headers();
    let url = this.url + 'TipoDocumento';
    return this.http.post<TipoDocumentoIdentidad>(url, object, { headers });
  }

  postFormaPago(object: FormaPagoPost) {
    let headers = this.Headers();
    let url = this.url + 'FormaPago';
    return this.http.post<FormaPago>(url, object, { headers });
  }

  postCargo(object: CargoPost) {
    let headers = this.Headers();
    let url = this.url + 'Cargo';
    return this.http.post<Cargo>(url, object, { headers });
  }

  postUsuario(object: UsuarioPost) {
    let headers = this.Headers();
    let url = this.url + 'Usuario';
    return this.http.post<Usuario>(url, object, { headers });
  }


  postCliente(object: ClientePost) {
    let headers = this.Headers();
    let url = this.url + 'Cliente';
    return this.http.post<Cliente>(url, object, { headers });
  }

  postSuscripcion(object: SuscripcionPost) {
    let headers = this.Headers();
    let url = this.url + 'Suscripcion';
    return this.http.post<Suscripcion>(url, object, { headers });
  }

  postVerificarCliente(documento: string){
    let headers = this.Headers();
    let url = this.url + 'Vendedor';
    return this.http.post<Vendedor>(url, documento, { headers });
  }

  postPlan(object: PlanPost) {
    let headers = this.Headers();
    let url = this.url + 'Plan';
    return this.http.post<Plan>(url, object, { headers });
  }

  postPago(object: PagoPost) {
    let headers = this.Headers();
    let url = this.url + 'Pago';
    return this.http.post<Pago>(url, object, { headers });
  }

  postVisita(object: VisitaPost) {
    let headers = this.Headers();
    let url = this.url + 'Visita';
    return this.http.post<Visita>(url, object, { headers });
  }

  postVenta(object: VentaDetalles) {
    let headers = this.Headers();
    let url = this.url + 'Venta';
    return this.http.post<Venta>(url, object, { headers });
  }

  postPrecioIngreso(object: PrecioIngresoPost) {
    let headers = this.Headers();
    let url = this.url + 'PrecioIngreso';
    return this.http.post<PrecioIngreso>(url, object, { headers });
  }













  postGetPagoByTipoMovimiento(obj: PagoMovimientoBusqueda) {
    let headers = this.Headers();
    let url = this.url + 'Pago/PorMovimiento';

    return this.http.post<Pago[]>(url, obj, { headers });
  }

  postActualizacionInscripciones() {
    let headers = this.Headers();
    let url = this.url + 'ActualizacionSuscripciones/ejecutar';
    return this.http.post<PrecioIngreso>(url,{ headers });
  }




  postReporteVenta(obj: ReporteVentaBusqueda) {
    let headers = this.Headers();
    let url = this.url + 'Reportes/ReporteVenta';
    return this.http.post<ReporteVenta[]>(url, obj, { headers });
  }

  postReportePago(obj: ReportePagoBusqueda) {
    let headers = this.Headers();
    let url = this.url + 'Reportes/ReportePago';
    return this.http.post<Pago[]>(url, obj, { headers });
  }

  postReporteInscripciones(obj: ReporteInscripcionBusqueda) {
    let headers = this.Headers();
    let url = this.url + 'Reportes/ReporteInscripcion';
    return this.http.post<Suscripcion[]>(url, obj, { headers });
  }


  // Dashboard
  postTopProductosVendidos(year: number) {
    let headers = this.Headers();
    let url = this.url + 'Dashboard/DashboardProductosVendidos?year=' + year;
    return (this.http.post<TopProductosVendidos[]>(url, { headers }))
  }

}
