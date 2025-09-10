import { inject, Injectable, signal } from '@angular/core';
import { Pago } from '../../../Interfaces/Pago';
import { MatTableDataSource } from '@angular/material/table';
import { GetApiService } from '../../../Services/get-api.service';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  constructor() { }

  getApi = inject(GetApiService);


 listaTotal = signal<Pago[]>([]);
  listaTabla = signal<Pago[]>([]);
  dataSource = new MatTableDataSource<Pago>();

  async GetData() {
    let resp = await this.getApi.getPago();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal())
    this.dataSource.data = this.listaTabla()
    // this.recarga("", "","","",true, new Date(), new Date())
  }

 async recarga(
    // numero: string,
    clientebusqueda: string,
    vendedorbusqueda: string,
    estadobusqueda: string,
    conceptogirobusqueda: string,
    habilitarFiltroFecha: boolean,
    fechaInicio: Date | null,
    fechaFin: Date | null
  ) {
    // let filtronumero = numero.trim().toLowerCase();
    if (
      !habilitarFiltroFecha &&
      // filtronumero === '' &&
      clientebusqueda === '' &&
      vendedorbusqueda === '' &&
      conceptogirobusqueda === '' &&
      estadobusqueda === ''
    ) {
      this.listaTabla.set(this.listaTotal());
      this.dataSource.data = this.listaTabla()
    } else {

      this.listaTabla.set(
        this.listaTotal().filter((p) => {
          // let matchId = filtronumero === '' || p.id.toString() === numero;

          let matchcliente =
            clientebusqueda == '' ||
            p.cliente?.toUpperCase().includes(clientebusqueda);

            let matchvendedor =
            vendedorbusqueda == '' ||
            p.registradoPor?.toUpperCase().includes(vendedorbusqueda);


          let matchestado =
            estadobusqueda == '' ||
            p.estado.toUpperCase().includes(estadobusqueda);

          let matchconceptogiro =
            conceptogirobusqueda == '' ||
            p.tipoMovimientoAsociado.toUpperCase().includes(conceptogirobusqueda);

          let matchFecha =
            !habilitarFiltroFecha ||
            (
              fechaInicio &&
              fechaFin &&
              new Date(p.fechaPago).toISOString().split('T')[0] >= fechaInicio.toISOString().split('T')[0] &&
              new Date(p.fechaPago).toISOString().split('T')[0] <= fechaFin.toISOString().split('T')[0]
            );


          return (
            // matchId &&
            matchcliente &&
            matchvendedor &&
            matchconceptogiro &&
            matchestado &&
            matchFecha
          );
        })
      );
    }

    this.dataSource.data = this.listaTabla();
  }

}
