import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { Usuario, UsuarioDTOReporte } from '../Interfaces/Usuario';
import { TipoDocumentoIdentidad } from '../Interfaces/Global/TipoDocumentoIdentidad';
import { Cargo } from '../Interfaces/Vendedor/Cargo';
import { FormaPago } from '../Interfaces/FormaPago';
import { environment } from '../Environments/Environment';
import { Cliente } from '../Interfaces/Cliente/Cliente';
import { Plan } from '../Interfaces/Plan';
import { Suscripcion } from '../Interfaces/Suscripcion';
import { Pago, PagoMovimientoBusqueda, PagosPorMesDto } from '../Interfaces/Pago';
import { Producto } from '../Interfaces/Producto';
import { DniDTO } from '../Interfaces/Dni/DniDTO';
import { DetalleVenta, Venta } from '../Interfaces/Gestion/Venta';
import { Visita } from '../Interfaces/Gestion/Visita';
import { PrecioIngreso, PrecioIngresoPost } from '../Interfaces/Gestion/PrecioIngreso';
import { DashboardTotalVentasDTO, TopProductosVendidos } from '../Interfaces/Dashboard/TopProductosVendidos';


@Injectable({
  providedIn: 'root'
})
export class GetApiService {

  constructor(private http: HttpClient) { }
  session = inject(AuthService)


  Headers() {
    return new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.session.GetToken()
    );
  }

  url = environment.urlApi;

  GetUsuarios() {
    let headers = this.Headers();
    let url = this.url + 'Usuario';
    return firstValueFrom(this.http.get<Usuario[]>(url, { headers }));
  }

  GetClientes() {
    let headers = this.Headers();
    let url = this.url + 'Cliente';
    return firstValueFrom(this.http.get<Cliente[]>(url, { headers }));
  }

  GetUsuarioDTOReporte() {
    let headers = this.Headers();
    let url = this.url + 'Usuario/GetUsuarioDTOReporte';
    return firstValueFrom(this.http.get<UsuarioDTOReporte[]>(url, { headers }));
  }

  getTipoDocumento() {
    let headers = this.Headers();
    let url = this.url + 'TipoDocumento';
    return firstValueFrom(this.http.get<TipoDocumentoIdentidad[]>(url, { headers }));
  }

  getCargo() {
    let headers = this.Headers();
    let url = this.url + 'Cargo';
    return firstValueFrom(this.http.get<Cargo[]>(url, { headers }));
  }

  getFormaPago() {
    let headers = this.Headers();
    let url = this.url + 'FormaPago';
    return firstValueFrom(this.http.get<FormaPago[]>(url, { headers }));
  }


  getPlan() {
    let headers = this.Headers();
    let url = this.url + 'Plan';
    return firstValueFrom(this.http.get<Plan[]>(url, { headers }));
  }

  getPago() {
    let headers = this.Headers();
    let url = this.url + 'Pago';
    return firstValueFrom(this.http.get<Pago[]>(url, { headers }));
  }

  getPagoByYear(year: number) {
    let headers = this.Headers();
    let url = this.url + 'Pago/porMes?anio=' + year;
    return firstValueFrom(this.http.get<PagosPorMesDto[]>(url, { headers }))
  }

  getVentasTotal() {
    let headers = this.Headers();
    let url = this.url + 'Dashboard/TotalVentas';
    return firstValueFrom(this.http.get<DashboardTotalVentasDTO>(url, { headers }))
  }

  getVentasByYear(year: number) {
    let headers = this.Headers();
    let url = this.url + 'Dashboard/VentasPorAnio?anio=' + year;
    return firstValueFrom(this.http.post<PagosPorMesDto[]>(url, { headers }))
  }

  getUsuarioById(id: string) {
    let headers = this.Headers()
    let url = this.url + 'Usuario/' + id
    return this.http.get<Usuario>(url, { headers }).pipe(
      catchError((error) => {
        let err: Observable<Usuario> = {} as Observable<Usuario>;
        return err;
      })
    );
  }

  getUltimaMembresia() {
    let headers = this.Headers()
    let url = this.url + 'Recibo/ultimo-id'
    return (this.http.get<number>(url, { headers }).pipe(
      catchError((error) => {
        let err: Observable<number> = {} as Observable<number>;
        return err;
      })
    ));
  }


 GetSuscripcion() {
    let headers = this.Headers();
    let url = this.url + 'Suscripcion';
    return firstValueFrom(this.http.get<Suscripcion[]>(url, { headers }));
  }

  getClienteByDocumento(documento: string) {
    let headers = this.Headers()
    let url = this.url + 'Cliente/documento/' + documento
    return this.http.get<Cliente>(url, { headers })
  }

  getSuscripcionByIdCliente(id: number) {
    let headers = this.Headers();
    let url = this.url + 'Suscripcion/IdCliente?id=' + id;
    return (this.http.get<Suscripcion>(url, { headers }))
  }

 getPlanById(id: number) {
    let headers = this.Headers();
    let url = this.url + 'Plan/' + id;
    return this.http.get<Plan>(url, { headers })
  }

  getPagoByIdSuscripcion(id: number) {
    let headers = this.Headers();
    let url = this.url + 'Pago/IdSuscripcion?id=' + id;
    return firstValueFrom(this.http.get<Pago[]>(url, { headers }));
  }

// getPagoByTipoMovimiento(obj: PagoMovimientoBusqueda) {
//   let headers = this.Headers();
//   let params = new HttpParams()
//     .set('TipoMovimientoAsociado', obj.TipoMovimientoAsociado)
//     .set('MovimientoAsociadoID', obj.MovimientoAsociadoID.toString());

//   let url = this.url + 'Pago/IdMovimiento';
//   return firstValueFrom(this.http.post<Pago[]>(url, obj,{ headers }));
// }



  getDetallesByIdVenta(id: number) {
    let headers = this.Headers();
    let url = this.url + 'DetalleVenta/idVenta?id=' + id;
    return firstValueFrom(this.http.get<DetalleVenta[]>(url, { headers }));
  }

  GetProducto() {
    let headers = this.Headers();
    let url = this.url + 'Producto';
    return firstValueFrom(this.http.get<Producto[]>(url, { headers }));
  }

  getNombreByDni(documento: string) {
    let headers = this.Headers();
    let url = this.url + 'Sunat/ObtenerDNI/' + documento;
    return firstValueFrom(this.http.get<DniDTO>(url, { headers }));
  }

  GetVenta() {
    let headers = this.Headers();
    let url = this.url + 'Venta';
    return firstValueFrom(this.http.get<Venta[]>(url, { headers }));
  }

  GetVisita() {
    let headers = this.Headers();
    let url = this.url + 'Visita';
    return firstValueFrom(this.http.get<Visita[]>(url, { headers }));
  }

 getPrecioIngreso() {
    let headers = this.Headers();
    let url = this.url + 'PrecioIngreso';
    return firstValueFrom(this.http.get<PrecioIngreso>(url, { headers }));
  }




}
