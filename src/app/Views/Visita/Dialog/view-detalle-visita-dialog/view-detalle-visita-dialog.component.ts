import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Visita } from '../../../../Interfaces/Gestion/Visita';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GetApiService } from '../../../../Services/get-api.service';
import { Pago } from '../../../../Interfaces/Pago';

@Component({
  selector: 'app-view-detalle-visita-dialog',
imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './view-detalle-visita-dialog.component.html',
  styleUrl: './view-detalle-visita-dialog.component.css'
})
export class ViewDetalleVisitaDialogComponent {


 constructor(public dialogRef: MatDialogRef<ViewDetalleVisitaDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: Visita,)
  {
    this.visita = data
  }

  visita: Visita = {} as Visita

  displayedColumns: string[] = [
    'producto',
    'precio',
    'cantidad',
    'total',
  ];

  getApi = inject(GetApiService);

  listaTabla = signal<Pago[]>([]);
  dataSource = new MatTableDataSource<Pago>();


  total = signal<number>(0)



async getPagos(){
    // let resp = await this.getApi.getPagoByTipoMovimiento(this.suscripcion.id, "VISITA OCASIONAL");
    // this.listaTotal.set(resp);
    // this.listaTabla.set(this.listaTotal());
    // let total = this.listaTabla().reduce((acc, pago) => acc + pago.monto, 0);
    // this.total.set(total)
    // this.dataSource.data = this.listaTabla();
  }

  ngOnInit(){
    this.getPagos()
  }

}
