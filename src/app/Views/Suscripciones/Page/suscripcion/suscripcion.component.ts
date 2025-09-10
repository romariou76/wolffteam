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
import { MatSelectModule } from '@angular/material/select';
import { AlertsService } from '../../../../Services/alerts.service';
import { DeleteApiService } from '../../../../Services/delete-api.service';
import { GetApiService } from '../../../../Services/get-api.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from '../../../../Services/errors.service';
import { AddSuscripcionDialogComponent } from '../../Dialog/add-suscripcion-dialog/add-suscripcion-dialog.component';
import { EditSuscripcionDialogComponent } from '../../Dialog/edit-suscripcion-dialog/edit-suscripcion-dialog.component';
import { Suscripcion } from '../../../../Interfaces/Suscripcion';
import { CobrarSuscripcionDialogComponent } from '../../Dialog/cobrar-suscripcion-dialog/cobrar-suscripcion-dialog.component';
import { ViewPagosSuscripcionDialogComponent } from '../../Dialog/view-pagos-suscripcion-dialog/view-pagos-suscripcion-dialog.component';
import { ViewDetallesSuscripcionComponent } from '../../Dialog/view-detalles-suscripcion/view-detalles-suscripcion.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-suscripcion',
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
    MatDatepickerModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './suscripcion.component.html',
  styleUrl: './suscripcion.component.css'
})
export class SuscripcionComponent {

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
    'Acciones',
  ];

  api = inject(GetApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService);

  listaTotal = signal<Suscripcion[]>([]);
  listaTabla = signal<Suscripcion[]>([]);
  dataSource = new MatTableDataSource<Suscripcion>();
  paginator = viewChild.required(MatPaginator);
  total = signal<number>(0)
  totalPagado = signal<number>(0)

  dialog = inject(MatDialog);
  errorService = inject(ErrorsService);

  openAddDialog = signal<number>(0);
  openCobrarDialog = signal<number>(0);
  isLoading = signal<boolean>(false)


  busqueda: string = ""
  numero: string = '';
  estadobusqueda = signal<string>('');
  clientebusqueda = signal<string>('');
  planbusqueda = signal<string>('');
  habilitarFiltroFecha: boolean = false;
  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+' && this.openAddDialog() == 0) {
      this.clickAdd();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator()
  }

  async GetData() {
    this.isLoading.set(true)
    let resp = await this.api.GetSuscripcion();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
    this.setTotal()
    this.isLoading.set(false)
  }


  setTotal() {
    let itemsVisibles = this.dataSource._pageData(this.dataSource.filteredData);
    let total = itemsVisibles.reduce((acc, item) => acc + item.total, 0);
    let totalPagado = itemsVisibles.reduce((acc, item) => acc + item.totalPagado, 0);
    this.total.set(total)
    this.totalPagado.set(totalPagado)
  }

  async recarga() {
    this.filtrarData(
      this.numero.toUpperCase().trim(),
      this.habilitarFiltroFecha,
      this.fechaInicio,
      this.fechaFin,
      this.estadobusqueda().toUpperCase().trim(),
      this.clientebusqueda().toUpperCase().trim(),
      this.planbusqueda().toUpperCase().trim()
    );
  }

  normalizarFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0]; // devuelve 'YYYY-MM-DD'
  }

  async filtrarData(
    numero: string,
    habilitarFiltroFecha: boolean,
    fechaInicio: Date | null,
    fechaFin: Date,
    estadobusqueda: string,
    clientebusqueda: string,
    planbusqueda: string,
  ) {
    if (
      !habilitarFiltroFecha &&
      numero === '' &&
      estadobusqueda === '' &&
      planbusqueda === '' &&
      clientebusqueda === ''
    ) {
      this.listaTabla.set(this.listaTotal());
      this.dataSource.data = this.listaTabla()
      this.setTotal()
    } else {
      this.listaTabla.set(
        this.listaTotal().filter((p) => {
          let matchId = numero == '' || p.codigo.toString().includes(numero);

          let matchsFecha =
            !habilitarFiltroFecha ||
            (fechaInicio &&
              fechaFin &&
              this.normalizarFecha(new Date(p.fechaRegistro)) >= this.normalizarFecha(fechaInicio) &&
              this.normalizarFecha(new Date(p.fechaRegistro)) <= this.normalizarFecha(fechaFin));

          let matchestado =
            estadobusqueda == '' ||
            p.estado.toUpperCase().includes(estadobusqueda);

          let matchCliente =
            clientebusqueda == '' ||
            p.cliente.toUpperCase().includes(clientebusqueda);

          let matchPlan =
            planbusqueda == '' ||
            p.plan.toUpperCase().includes(planbusqueda);

          return (
            matchId &&
            matchestado &&
            matchCliente &&
            matchPlan &&
            matchsFecha
          );
        })
      );
      this.dataSource.data = this.listaTabla()
      this.setTotal()
    }
  }


  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddSuscripcionDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        //   this.listaTotal.update(() => [...this.listaTotal(), resp]);
        //       this.listaTabla.set(this.listaTotal());
        // this.dataSource.data = this.listaTabla();
        //     this.setTotal()
        this.GetData();
      }
    });
  }

  clickViewDetalles(object: Suscripcion) {
    let dial = this.dialog.open(ViewDetallesSuscripcionComponent, {
      width: '100%',
      maxWidth: '1300px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {
    });
  }

  clickCobrar(obj: Suscripcion) {
    this.openCobrarDialog.set(1)
    let dial = this.dialog.open(CobrarSuscripcionDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true,
      data: obj
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openCobrarDialog.set(0)
      if (resp) {
        this.GetData();
      }
    });
  }

  clickEdit(obj: Suscripcion){
    if(obj.estado == 'CULMINADO'){
      this.alerts.alertInfo("No se puede editar una inscripción culminada")
      return;
    }
    let dial = this.dialog.open(EditSuscripcionDialogComponent, {
      width: "100%",
      maxWidth: "1100px",
      data: obj
    })

    dial.afterClosed().subscribe(async(resp) => {
      if (resp) {
        this.GetData();
      }
    })
  }

  // async clickViewPagos(object: Suscripcion) {
  //   let dial = this.dialog.open(ViewPagosSuscripcionDialogComponent, {
  //     width: "100%",
  //     maxWidth: "1100px",
  //     data: object
  //   })

  //   dial.afterClosed().subscribe(() => {

  //   })
  // }


  obtenerEstado(fechaFin: string | Date): string {
    const hoy = new Date();
    const fin = new Date(fechaFin);

    const esHoy =
      hoy.getFullYear() === fin.getFullYear() &&
      hoy.getMonth() === fin.getMonth() &&
      hoy.getDate() === fin.getDate();
    return esHoy ? 'VENCIDO' : 'VIGENTE';
  }

 exportarExcel() {
    let data: any[] = [];
    this.dataSource.filteredData.forEach((e) => {
      let isPagado = e.pagado
      data.push(
        {
          CODIGO: e.codigo,
          CLIENTE: e.cliente,
          PLAN: e.plan,
          PERIODO: this.setFecha(e.fechaInicio) + " - " + this.setFecha(e.fechaFin),
          TOTAL: e.total,
          TOTALPAGADO: e.totalPagado,
          PAGADO: isPagado ? "SI" : "NO",
          ESTADO: e.estado,
          FECHA: e.fechaRegistro,
          OBSERVACIONES: e.observaciones || ""
        });
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ["", "             INSCRIPCIONES", "", ""],
      ["", `DEL ${this.setFecha(this.fechaInicio)} AL ${this.setFecha(this.fechaFin)}`.padStart(30), "", ""],
      [],
      ["CODIGO", "CLIENTE", "PLAN", "PERIODO", "TOTAL", "TOTAL PAGADO", "PAGADO", "ESTADO", "FECHA REGISTRO","OBSERVACIONES"]
    ]);

    worksheet["!merges"] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } },
    ];

    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A5", skipHeader: true });
    const lastRow = 5 + data.length;
    XLSX.utils.sheet_add_aoa(worksheet, [["", "", "Total S/.", Number(this.total().toFixed(2))]], { origin: `B${lastRow}` });
    const workbook: XLSX.WorkBook = {
      Sheets: { Inscripciones: worksheet },
      SheetNames: ["Inscripciones"],
    };
    XLSX.writeFile(workbook, "Inscripciones.xlsx");
  }

exportarPDF(){

}

setFecha(fecha: Date): string {
    let f = new Date(fecha).toLocaleDateString('es-ES');
    return f;
}

  ngOnInit() {
    this.GetData();
  }

}
