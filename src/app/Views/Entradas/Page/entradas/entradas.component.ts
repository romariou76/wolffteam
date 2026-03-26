import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GetApiService } from '../../../../Services/get-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from '../../../../Services/errors.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import * as XLSX from "xlsx";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { Entrada } from '../../../../Interfaces/PaseEntrada/Entrada';

@Component({
  selector: 'app-entradas',
 imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './entradas.component.html',
  styleUrl: './entradas.component.css'
})
export class EntradasComponent {

displayedColumns: string[] = [
  'id',
  'cliente',
  'concepto',
  'fechaPago',
  'monto',
  'formaDePago',
  'estado',
  'registradoPor',
  // 'Acciones'
];

  alerts = inject(AlertsService);
  getApi = inject(GetApiService);
  dialog = inject(MatDialog);
  errorService = inject(ErrorsService);

  fechaDesde: Date = new Date();
  fechaHasta: Date = new Date();
	habilitarFiltroFecha = signal<boolean>(false);

  clientebusqueda: string = ""
  vendedorbusqueda: string = ""
  conceptobusqueda: string = ""
  estadobusqueda: string = ""

  openAddDialog = signal<number>(0);
  openCobrarDialog = signal<number>(0);

  listaTotal = signal<Entrada[]>([]);
  listaTabla = signal<Entrada[]>([]);
  dataSource = new MatTableDataSource<Entrada>();
  isLoading = signal<boolean>(false)
  paginator = viewChild.required(MatPaginator);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator()
  }

  async GetData() {
    this.isLoading.set(true)
    let resp = await this.getApi.GetEntrada();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
    this.isLoading.set(false)
  }

  setFecha(fecha: Date): string {
      let f = new Date(fecha).toLocaleDateString('es-ES');
      return f;
  }

  ngOnInit() {
    this.GetData();
  }


}
