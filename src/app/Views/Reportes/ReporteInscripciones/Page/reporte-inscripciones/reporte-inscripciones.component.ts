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
import { AlertsService } from '../../../../../Services/alerts.service';
import { ErrorsService } from '../../../../../Services/errors.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import * as XLSX from "xlsx";
import { PdfService } from '../../../../../Services/pdf.service';
import { SelectClienteComponent } from '../../../../Clients/Select/select-cliente/select-cliente.component';
import { SelectUsuarioComponent } from '../../../../Usuario/Select/select-usuario/select-usuario.component';
import { PostApiService } from '../../../../../Services/post-api.service';
import { firstValueFrom } from 'rxjs';
import { Cliente } from '../../../../../Interfaces/Cliente/Cliente';
import { UsuarioDTOReporte } from '../../../../../Interfaces/Usuario';
import { ReporteInscripcionBusqueda, Suscripcion } from '../../../../../Interfaces/Suscripcion';
import { SelectPlanComponent } from '../../../../Planes/Select/select-plan/select-plan.component';
import { Plan } from '../../../../../Interfaces/Plan';
import { SelectEstadoComponent } from '../../../../../Components/SelectGlobal/select-estado/select-estado.component';
import { SelectPagadoComponent } from '../../../../../Components/select-pagado/select-pagado.component';

interface Estado {
  id: number
  descripcion: string
}

interface Pagado {
  id: number
  descripcion: string
}

@Component({
  selector: 'app-reporte-inscripciones',
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
    SelectUsuarioComponent,
    SelectPlanComponent,
    SelectEstadoComponent,
    SelectPagadoComponent
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './reporte-inscripciones.component.html',
  styleUrl: './reporte-inscripciones.component.css'
})
export class ReporteInscripcionesComponent {

  displayedColumns: string[] = [
    'numero',
    'cliente',
    'plan',
    'periodo',
    'total',
    'totalpagado',
    'pagado',
    'estado',
    // 'creadoPor',
    'fechaRegistro',
  ];

  selectCliente = viewChild.required(SelectClienteComponent);
  selectUsuario = viewChild.required(SelectUsuarioComponent);
  selectPlan = viewChild.required(SelectPlanComponent);
  selectEstado = viewChild.required(SelectEstadoComponent);
  selectPagado = viewChild.required(SelectPagadoComponent);

  postApi = inject(PostApiService);
  alerts = inject(AlertsService);
  errorService = inject(ErrorsService);
  pdfService = inject(PdfService)
  listaTabla = signal<Suscripcion[]>([]);
  dataSource = new MatTableDataSource<Suscripcion>();

  clienteBusqueda: string = ""
  vendedorBusqueda: string = ""
  planBusqueda: string = ""
  estadoBusqueda: string = ""
  pagadoBusqueda: boolean | null = null
  desde: Date = new Date()
  hasta: Date = new Date()

  total = signal<number>(0)
  totalPagado = signal<number>(0)
  isLoading = signal<boolean>(false)

  async GetReporte() {
    let obj: ReporteInscripcionBusqueda = {
      cliente: this.clienteBusqueda.trim().toUpperCase() || null,
      vendedor: this.vendedorBusqueda.trim().toUpperCase() || null,
      plan: this.planBusqueda.trim().toUpperCase() || null,
      estado: this.estadoBusqueda.trim().toUpperCase() || null,
      pagado: this.pagadoBusqueda,
      fechaDesde: this.desde,
      fechaHasta: this.hasta
    }
    try {
      this.isLoading.set(true)
      let resp = await firstValueFrom(this.postApi.postReporteInscripciones(obj));
      this.listaTabla.set(resp)
      this.dataSource.data = this.listaTabla()
      this.isLoading.set(false)
      this.setTotales()
    } catch (error) {
      this.setTotales()
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

  eventPlan(id: number) {
    this.planBusqueda = this.selectPlan().plan.nombre
  }

  eventEstado(resp: string) {
    this.estadoBusqueda = this.selectEstado().estado.descripcion
  }

  eventPagado(id: number) {
    if (id == 1) {
      this.pagadoBusqueda = true
    } else if (id == 2) {
      this.pagadoBusqueda = false
    } else {
      this.pagadoBusqueda = null
    }
  }

  setTotales() {
    let total = this.listaTabla().reduce((acc, item) => acc + item.total, 0);
    let totalPagado = this.listaTabla().reduce((acc, item) => acc + item.totalPagado, 0);
    this.total.set(total)
    this.totalPagado.set(totalPagado)
  }

  exportarExcel() {
    let data: any[] = [];
    this.dataSource.filteredData.forEach((e) => {
      data.push({
        CODIGO: e.codigo,
        CLIENTE: e.cliente,
        PLAN: e.plan,
        PERIODO: `${this.setFecha(e.fechaInicio)} al ${this.setFecha(e.fechaFin)}`,
        TOTAL: e.total,
        TOTALPAGADO: e.totalPagado,
        PAGADO: e.pagado ? 'SI' : 'NO',
        ESTADO: e.estado,
        FECHAREGISTRO: this.setFecha(e.fechaRegistro),
        REGISTRADOPOR: e.creadoPor,
      });
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ["", "          REPORTE DE INSCRIPCIONES", "", ""],
      ["", `DEL ${this.setFecha(this.desde)} AL ${this.setFecha(this.hasta)}`, "", ""],
      [],
      ["CODIGO", "CLIENTE", "PLAN", "PERIODO", "TOTAL", "TOTAL PAGADO", "PAGADO", "ESTADO", "FECHA REGISTRO", "REGISTRADO POR"]
    ]);

    worksheet["!merges"] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },
    ];

    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A5", skipHeader: true });

    const lastRow = 5 + data.length;
    XLSX.utils.sheet_add_aoa(worksheet, [[
      "", "", "", "Totales:",
      Number(this.total().toFixed(2)),
      Number(this.totalPagado().toFixed(2))
    ]], { origin: `A${lastRow}` });

    const workbook: XLSX.WorkBook = {
      Sheets: { ReporteInscripciones: worksheet },
      SheetNames: ["ReporteInscripciones"],
    };

    XLSX.writeFile(workbook, "ReporteInscripciones.xlsx");
  }

  exportarPDF() {
    this.pdfService.exportarReporteInscripciones(this.listaTabla(), this.desde, this.hasta)
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
    this.planBusqueda = ""
    this.selectPlan().plan = {} as Plan
    this.selectPlan().myControl.reset()
    this.estadoBusqueda = ""
    this.selectEstado().estado = {} as Estado
    this.selectEstado().myControl.reset()
    this.pagadoBusqueda = null
    this.selectPagado().pagado = {} as Pagado
    this.selectPagado().myControl.reset()
    this.desde = new Date()
    this.hasta = new Date()
    this.desde.setHours(0, 0, 0, 0);
    this.hasta.setHours(0, 0, 0, 0);
    this.GetReporte();
  }

  ngOnInit() {
    this.desde.setHours(0, 0, 0, 0);
    this.hasta.setHours(0, 0, 0, 0);
    this.GetReporte();
  }


}
