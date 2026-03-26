import { Component, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Pase } from '../../../../Interfaces/PaseEntrada/PaseEntrada';
import { Entrada } from '../../../../Interfaces/PaseEntrada/Entrada';
import { GetApiService } from '../../../../Services/get-api.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-view-detalles-pase-entrada-dialog',
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
  templateUrl: './view-detalles-pase-entrada-dialog.component.html',
  styleUrl: './view-detalles-pase-entrada-dialog.component.css'
})
export class ViewDetallesPaseEntradaDialogComponent {

 constructor(public dialogRef: MatDialogRef<ViewDetallesPaseEntradaDialogComponent>,
  @Inject(MAT_DIALOG_DATA) private data: Pase,)
  {
    this.pase = data
  }

  pase: Pase = {} as Pase
  displayedColumns: string[] = [
    'numero',
    'fecha',
    'fechaUso',
    'usado',
  ];

  getApi = inject(GetApiService);
  isLoading = signal<boolean>(false)
  listaTotal = signal<Entrada[]>([]);
  listaTabla = signal<Entrada[]>([]);
  dataSource = new MatTableDataSource<Entrada>();
  total = signal<number>(0)

  async getData(){
    this.isLoading.set(true)
    let resp = await this.getApi.getEntradasByIdPase(this.pase.id);
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    // let total = this.listaTabla().reduce((acc, pago) => acc + pago.precioTotal, 0);
    // this.total.set(total)
    this.dataSource.data = this.listaTabla();
    this.isLoading.set(false)
  }

  ngOnInit(){
    this.getData()
  }

}
