import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DetalleVenta, Venta } from '../../../../Interfaces/Gestion/Venta';
import { GetApiService } from '../../../../Services/get-api.service';

@Component({
  selector: 'app-view-detalle-venta-dialog',
 imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './view-detalle-venta-dialog.component.html',
  styleUrl: './view-detalle-venta-dialog.component.css'
})
export class ViewDetalleVentaDialogComponent {


 constructor(public dialogRef: MatDialogRef<ViewDetalleVentaDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: Venta,)
  {
    this.venta = data
  }

  venta: Venta = {} as Venta

  displayedColumns: string[] = [
    'producto',
    'precio',
    'cantidad',
    'total',
  ];

  getApi = inject(GetApiService);

  listaTotal = signal<DetalleVenta[]>([]);
  listaTabla = signal<DetalleVenta[]>([]);
  dataSource = new MatTableDataSource<DetalleVenta>();
  total = signal<number>(0)

  async getData(){
    let resp = await this.getApi.getDetallesByIdVenta(this.venta.id);
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    let total = this.listaTabla().reduce((acc, pago) => acc + pago.precioTotal, 0);
    this.total.set(total)
    this.dataSource.data = this.listaTabla();
  }

  ngOnInit(){
    this.getData()
  }

}
