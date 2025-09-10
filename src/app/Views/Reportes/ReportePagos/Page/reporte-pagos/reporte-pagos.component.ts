import { CommonModule } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../../Components/loader/loader.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '../../../../../Interfaces/Global/FormatDate';
import { GetApiService } from '../../../../../Services/get-api.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { Venta } from '../../../../../Interfaces/Gestion/Venta';
import { ErrorsService } from '../../../../../Services/errors.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import * as XLSX from "xlsx";
import { PdfService } from '../../../../../Services/pdf.service';
import { Pago, ReportePagoBusqueda } from '../../../../../Interfaces/Pago';
import { SelectClienteComponent } from '../../../../Clients/Select/select-cliente/select-cliente.component';
import { SelectFormaPagoComponent } from '../../../../Maestros/FormaPago/Select/select-forma-pago/select-forma-pago.component';
import { SelectUsuarioComponent } from '../../../../Usuario/Select/select-usuario/select-usuario.component';
import { PostApiService } from '../../../../../Services/post-api.service';
import { firstValueFrom } from 'rxjs';
import { Cliente } from '../../../../../Interfaces/Cliente/Cliente';
import { UsuarioDTOReporte } from '../../../../../Interfaces/Usuario';
import { FormaPago } from '../../../../../Interfaces/FormaPago';


@Component({
  selector: 'app-reporte-pagos',
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
    MatSelectModule,
    MatDividerModule,
    MatDatepickerModule,
    SelectClienteComponent,
    SelectFormaPagoComponent,
    SelectUsuarioComponent
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './reporte-pagos.component.html',
  styleUrl: './reporte-pagos.component.css'
})
export class ReportePagosComponent {

  displayedColumns: string[] = [
    'numero',
    'cliente',
    'tipo',
    'fechaRegistro',
    'total',
    'formapago',
    'registradopor',
  ];

  selectCliente = viewChild.required(SelectClienteComponent);
  selectUsuario = viewChild.required(SelectUsuarioComponent);
  selectFormaDePago = viewChild.required(SelectFormaPagoComponent);

  postApi = inject(PostApiService);
  alerts = inject(AlertsService);
  errorService = inject(ErrorsService);
  pdfService = inject(PdfService)
  listaTabla = signal<Pago[]>([]);
  dataSource = new MatTableDataSource<Pago>();

  clienteBusqueda: string = ""
  vendedorBusqueda: string = ""
  formaDePagoBusqueda: string = ""
  tipoMovimientoBusqueda: string = ""
  desde: Date = new Date()
  hasta: Date = new Date()

  total = signal<number>(0)
  isLoading = signal<boolean>(false)

  async GetReporte() {
    let obj: ReportePagoBusqueda = {
      cliente: this.clienteBusqueda.trim().toUpperCase() || null,
      vendedor: this.vendedorBusqueda.trim().toUpperCase() || null,
      formaDePago: this.formaDePagoBusqueda.trim().toUpperCase() || null,
      tipoMovimiento: this.tipoMovimientoBusqueda.trim().toUpperCase() || null,
      fechaDesde: this.desde,
      fechaHasta: this.hasta
    }
    try {
      this.isLoading.set(true)
      let resp = await firstValueFrom(this.postApi.postReportePago(obj));
      this.listaTabla.set(resp)
      this.dataSource.data = this.listaTabla()
      this.isLoading.set(false)
      this.setTotal()
    } catch (error) {
      this.setTotal()
      this.isLoading.set(false)
      this.errorService.manejarErroresApi(error)
    }
  }

  eventCliente(id: number) {
    this.clienteBusqueda = this.selectCliente().cliente.nombre + " " + this.selectCliente().cliente.apellidos
  }
  eventUsuario(id: number) {
    this.vendedorBusqueda = this.selectUsuario().usuario.nombre + " " + this.selectUsuario().usuario.apellidos
  }

  eventFormaDePago(id: number) {
    this.formaDePagoBusqueda = this.selectFormaDePago().formaPago.descripcion
  }

  setTotal() {
    let total = this.listaTabla().reduce((acc, item) => acc + item.monto, 0);
    this.total.set(total)
  }

    exportarExcel() {
    let data: any[] = [];
    this.dataSource.filteredData.forEach((e) => {
      data.push(
        {
          NUMERO: e.id,
          CLIENTE: e.cliente,
          TIPO: e.tipoMovimientoAsociado,
          FECHA: e.fechaPago,
          TOTAL: e.monto,
          FORMAPAGO: e.formaDePago,
          REGISTRADOPOR: e.registradoPor,
          OBSERVACIONES: e.observaciones || ""
        });
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ["", "             REPORTE DE PAGOS", "", ""],
      ["", `DEL ${this.setFecha(this.desde)} AL ${this.setFecha(this.hasta)}`.padStart(30), "", ""],
      [],
      ["NUMERO", "CLIENTE","TIPO PAGO", "FECHA REGISTRO", "TOTAL", "FORMA DE PAGO", "REGISTRADO POR", "OBSERVACIONES"]
    ]);

    worksheet["!merges"] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } },
    ];

    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A5", skipHeader: true });
    const lastRow = 5 + data.length;
    XLSX.utils.sheet_add_aoa(worksheet, [["","", "Total S/.", Number(this.total().toFixed(2))]], { origin: `B${lastRow}` });
    const workbook: XLSX.WorkBook = {
      Sheets: { ReportePagos: worksheet },
      SheetNames: ["ReportePagos"],
    };
    XLSX.writeFile(workbook, "ReportePagos.xlsx");
  }

  exportarPDF() {
    this.pdfService.exportarReportePagos(this.listaTabla(), this.desde, this.hasta)
  }


  setFecha(fecha: Date): string {
    let f = new Date(fecha).toLocaleDateString('es-ES');
    return f;
  }

  async Limpiarfiltro() {
    this.clienteBusqueda = "";
    this.selectCliente().cliente = {} as Cliente
    this.selectCliente().myControl.reset()
    this.vendedorBusqueda = ""
    this.selectUsuario().usuario = {} as UsuarioDTOReporte
    this.selectUsuario().myControl.reset()
    this.formaDePagoBusqueda = ""
    this.selectFormaDePago().formaPago = {} as FormaPago
    this.selectFormaDePago().myControl.reset()
    this.desde = new Date()
    this.hasta = new Date()
    this.GetReporte();
    // console.log(this.selectCliente().cliente)
    // console.log(this.selectFormaDePago().formaPago)
    // console.log(this.selectUsuario().usuario)
  }

  ngOnInit() {
    this.desde.setHours(0, 0, 0, 0);
    this.hasta.setHours(0, 0, 0, 0);
    this.GetReporte();
  }


}
