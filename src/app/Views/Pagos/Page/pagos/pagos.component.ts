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
import { Pago } from '../../../../Interfaces/Pago';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from '../../../../Services/errors.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import * as XLSX from "xlsx";
import { PagoService } from '../../Service/pago.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  selector: 'app-pagos',
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
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent {

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


  paginator = viewChild.required(MatPaginator);

  dialog = inject(MatDialog);
  errorService = inject(ErrorsService);
  pagoService = inject(PagoService);

  fechaDesde: Date = new Date();
  fechaHasta: Date = new Date();
	habilitarFiltroFecha = signal<boolean>(false);

  clientebusqueda: string = ""
  vendedorbusqueda: string = ""
  conceptobusqueda: string = ""
  estadobusqueda: string = ""

  openAddDialog = signal<number>(0);
  openCobrarDialog = signal<number>(0);

  ngAfterViewInit() {
    this.pagoService.dataSource.paginator = this.paginator()
  }

  async GetData() {
		this.pagoService.GetData();
  }

  async Limpiarfiltro() {
		this.habilitarFiltroFecha.set(false);
		this.clientebusqueda = "";
		this.vendedorbusqueda = ""
		this.conceptobusqueda = ""
		this.estadobusqueda = ""
    this.fechaDesde = new Date()
    this.fechaHasta = new Date()
		this.recarga();
	}

  async recarga() {
		this.pagoService.recarga(
			this.clientebusqueda.toUpperCase().trim(),
			this.vendedorbusqueda.toUpperCase().trim(),
			this.estadobusqueda.toUpperCase().trim(),
			this.conceptobusqueda.toUpperCase().trim(),
			this.habilitarFiltroFecha(),
			this.fechaDesde,
			this.fechaHasta,
		);
	}

async exportarExcel() {
  let data: any[] = [];
  let total = 0
  this.pagoService.listaTabla().forEach((element) => {
    total += element.monto
    let dato: any = {
      Cliente: element.cliente,
      Concepto: element.tipoMovimientoAsociado,
      Fecha: element.fechaPago,
      Monto: element.monto,
      FormaPago: element.formaDePago,
      Estado: element.estado,
      Registrado: element.registradoPor,
    };
    data.push(dato);
  });

  const fechaDesde = this.fechaDesde;
  const fechaHasta = this.fechaHasta;
  const titulo = `PAGOS DEL ${this.setFecha(fechaDesde)} AL ${this.setFecha(fechaHasta)}`;

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

  XLSX.utils.sheet_add_aoa(worksheet, [[titulo]], { origin: "A1" });
  XLSX.utils.sheet_add_aoa(worksheet, [[
    "Cliente",
    "Concepto",
    "Fecha de Pago",
    "Monto",
    "Forma de Pago",
    "Estado",
    "Registrado por"
  ]], { origin: "A2" });

  XLSX.utils.sheet_add_json(worksheet, data, { origin: "A3", skipHeader: true });
  const lastRow = 5 + data.length;
    XLSX.utils.sheet_add_aoa(worksheet, [["", "Total S/.", Number(total.toFixed(2))]], { origin: `B${lastRow}` });

  const workbook: XLSX.WorkBook = {
    Sheets: { Pagos: worksheet },
    SheetNames: ["Pagos"],
  };

  XLSX.writeFile(workbook, "Pagos.xlsx");
}

exportarPDF(){

}

setFecha(fecha: Date): string {
    let f = new Date(fecha).toLocaleDateString('es-ES');
    return f;
}

clickViewDetalles(obj: Pago) {
    this.openCobrarDialog.set(1)
    // let dial = this.dialog.open(CobrarSuscripcionDialogComponent, {
    //   width: '100%',
    //   maxWidth: '1000px',
    //   disableClose: true,
    //   data: obj
    // });

    // dial.afterClosed().subscribe(async (resp) => {
    //   this.openCobrarDialog.set(0)
    //   if (resp) {
    //     this.GetData();
    //   }
    // });
  }

  ngOnInit() {
    this.GetData();
  }

}
