import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Suscripcion } from '../../../../Interfaces/Suscripcion';
import { GetApiService } from '../../../../Services/get-api.service';
import { Pago, PagoMovimientoBusqueda } from '../../../../Interfaces/Pago';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDivider } from '@angular/material/divider';
import { firstValueFrom } from 'rxjs';
import { PostApiService } from '../../../../Services/post-api.service';

@Component({
  selector: 'app-view-detalles-suscripcion',
  imports: [
    MatDialogModule,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDivider
  ],
  templateUrl: './view-detalles-suscripcion.component.html',
  styleUrl: './view-detalles-suscripcion.component.css'
})
export class ViewDetallesSuscripcionComponent {

  getApi = inject(GetApiService);
  postApi = inject(PostApiService);

  listaTotal = signal<Pago[]>([]);
  listaTabla = signal<Pago[]>([]);
  dataSource = new MatTableDataSource<Pago>();
  suscripcion: Suscripcion = {} as Suscripcion
  total = signal<number>(0);

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: Suscripcion){
    this.suscripcion = data
  }


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
