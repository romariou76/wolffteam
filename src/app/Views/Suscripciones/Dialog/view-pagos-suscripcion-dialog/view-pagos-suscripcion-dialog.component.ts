import { Component, Inject, inject, signal, viewChild } from '@angular/core';
import { Pago, PagoMovimientoBusqueda } from '../../../../Interfaces/Pago';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { GetApiService } from '../../../../Services/get-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Suscripcion } from '../../../../Interfaces/Suscripcion';
import { PostApiService } from '../../../../Services/post-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-view-pagos-suscripcion-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './view-pagos-suscripcion-dialog.component.html',
  styleUrl: './view-pagos-suscripcion-dialog.component.css'
})
export class ViewPagosSuscripcionDialogComponent {

 constructor(public dialogRef: MatDialogRef<ViewPagosSuscripcionDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: Suscripcion,)
  {
    this.suscripcion = data
  }

  suscripcion: Suscripcion = {} as Suscripcion

  displayedColumns: string[] = [
    'id',
    'concepto',
    'fecha',
    'monto',
    'formapago',
    'estado',
    'observaciones',
    'registradopor',
    // 'acciones',
  ];

  getApi = inject(GetApiService);
  postApi = inject(PostApiService);
  alerts = inject(AlertsService);

  listaTotal = signal<Pago[]>([]);
  listaTabla = signal<Pago[]>([]);
  dataSource = new MatTableDataSource<Pago>();
  total = signal<number>(0)

  async getPagos(){
    let obj: PagoMovimientoBusqueda = {
      TipoMovimientoAsociado: "INSCRIPCION",
      MovimientoAsociadoID: this.suscripcion.id
    }
    let resp = await firstValueFrom(this.postApi.postGetPagoByTipoMovimiento(obj));
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    let total = this.listaTabla().reduce((acc, pago) => acc + pago.monto, 0);
    this.total.set(total)
    this.dataSource.data = this.listaTabla();
  }



  ngOnInit(){
    this.getPagos()
  }

}
