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
import { Suscripcion } from '../../../../Interfaces/Suscripcion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as XLSX from "xlsx";
import { EditPaseEntradaDialogComponent } from '../../Dialog/edit-pase-entrada-dialog/edit-pase-entrada-dialog.component';
import { ViewDetallesPaseEntradaDialogComponent } from '../../Dialog/view-detalles-pase-entrada-dialog/view-detalles-pase-entrada-dialog.component';
import { AddPaseEntradaDialogComponent } from '../../Dialog/add-pase-entrada-dialog/add-pase-entrada-dialog.component';
import { Pase } from '../../../../Interfaces/PaseEntrada/PaseEntrada';
import { ViewQrPaseDialogComponent } from '../../Dialog/view-qr-pase-dialog/view-qr-pase-dialog.component';

@Component({
  selector: 'app-pase-entrada',
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
  templateUrl: './pase-entrada.component.html',
  styleUrl: './pase-entrada.component.css'
})
export class PaseEntradaComponent {


  displayedColumns: string[] = [
    'numero',
    'cliente',
    'cantidadCompradas',
    'cantidadRestante',
    'total',
    // 'totalpagado',
    // 'estado',
    // 'creadoPor',
    'fechaRegistro',
    'Acciones',
  ];

  api = inject(GetApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService);

  listaTotal = signal<Pase[]>([]);
  listaTabla = signal<Pase[]>([]);
  dataSource = new MatTableDataSource<Pase>();
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
    let resp = await this.api.GetPaseEntrada();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
    this.setTotal()
    this.isLoading.set(false)
  }


  setTotal() {
    // let itemsVisibles = this.dataSource._pageData(this.dataSource.filteredData);
    // let total = itemsVisibles.reduce((acc, item) => acc + item.total, 0);
    // let totalPagado = itemsVisibles.reduce((acc, item) => acc + item.totalPagado, 0);
    // this.total.set(total)
    // this.totalPagado.set(totalPagado)
  }



  normalizarFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0]; // devuelve 'YYYY-MM-DD'
  }




  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddPaseEntradaDialogComponent, {
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
    let dial = this.dialog.open(ViewDetallesPaseEntradaDialogComponent, {
      width: '100%',
      maxWidth: '1300px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {
    });
  }

  clickCobrar(obj: Suscripcion) {
    // this.openCobrarDialog.set(1)
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

clickViewQR(object: Pase) {
    let dial = this.dialog.open(ViewQrPaseDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {

    });
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
