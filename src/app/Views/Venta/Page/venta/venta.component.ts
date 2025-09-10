import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { GetApiService } from '../../../../Services/get-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { Venta } from '../../../../Interfaces/Gestion/Venta';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from '../../../../Services/errors.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { AddVentaDialogComponent } from '../../Dialog/add-venta-dialog/add-venta-dialog.component';
import { ViewDetalleVentaDialogComponent } from '../../Dialog/view-detalle-venta-dialog/view-detalle-venta-dialog.component';
import { firstValueFrom } from 'rxjs';
import { PostApiService } from '../../../../Services/post-api.service';

@Component({
  selector: 'app-venta',
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
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})
export class VentaComponent {


displayedColumns: string[] = [
  'numero',
  'cliente',
  'fechaRegistro',
  'total',
  'estado',
  'registradopor',
  'opt',
];

  api = inject(GetApiService);
  alerts = inject(AlertsService);
  postApi = inject(PostApiService)

  listaTotal = signal<Venta[]>([]);
  listaTabla = signal<Venta[]>([]);
  dataSource = new MatTableDataSource<Venta>();

  paginator = viewChild.required(MatPaginator);
  total = signal<number>(0)
  totalPagado = signal<number>(0)

  dialog = inject(MatDialog);
  errorService = inject(ErrorsService);

  openAddDialog = signal<number>(0);
  openCobrarDialog = signal<number>(0);
  isLoading = signal<boolean>(false)

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
    let resp = await this.api.GetVenta();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
    this.isLoading.set(false)
  }

  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddVentaDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        this.GetData();
      }
    });
  }

  clickViewDetalles(object: Venta) {
    let dial = this.dialog.open(ViewDetalleVentaDialogComponent, {
      width: '100%',
      maxWidth: '1300px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {

    });
  }



  ngOnInit() {
    this.GetData();
        this.actualizarSuscripciones()
  }

  async actualizarSuscripciones(){
    try {
      let resp = await firstValueFrom(this.postApi.postActualizacionInscripciones())
    } catch (error) {
      this.errorService.manejarErroresApi(error);
    }
  }

}
