import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectFormaPagoComponent } from '../../../Maestros/FormaPago/Select/select-forma-pago/select-forma-pago.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PostApiService } from '../../../../Services/post-api.service';
import { AuthService } from '../../../../Services/auth.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { PagoPost } from '../../../../Interfaces/Pago';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { SelectClienteComponent } from '../../../Clients/Select/select-cliente/select-cliente.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddClienteDialogComponent } from '../../../Clients/Dialog/add-cliente-dialog/add-cliente-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { AddVisitaDialogComponent } from '../../Dialog/add-visita-dialog/add-visita-dialog.component';
import { AddVisitaClienteDialogComponent } from '../../Dialog/add-visita-cliente-dialog/add-visita-cliente-dialog.component';
import { Visita } from '../../../../Interfaces/Gestion/Visita';
import { GetApiService } from '../../../../Services/get-api.service';
import { ViewDetalleVisitaDialogComponent } from '../../Dialog/view-detalle-visita-dialog/view-detalle-visita-dialog.component';
import { ScanearQrEntradaDialogComponent } from '../../Dialog/scanear-qr-entrada-dialog/scanear-qr-entrada-dialog.component';



@Component({
  selector: 'app-visita',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    SelectFormaPagoComponent,
    MatDatepickerModule,
    MatIconModule,
    SelectClienteComponent,
    MatTooltipModule,
    MatPaginatorModule,
    MatTableModule,
  ],
    providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './visita.component.html',
  styleUrl: './visita.component.css'
})
export class VisitaComponent {
displayedColumns: string[] = [
    'id',
    'cliente',
    'inscripcion',
    'tipo',
    'fecha',
    'acciones',
  ];

  postApi = inject(PostApiService)
  getApi = inject(GetApiService)
  authService = inject(AuthService);
  alerts = inject(AlertsService)
  dialog = inject(MatDialog);
  errorService = inject(ErrorsService)
  selectFormaPago = viewChild.required(SelectFormaPagoComponent);


  listaTotal = signal<Visita[]>([]);
  listaTabla = signal<Visita[]>([]);
  dataSource = new MatTableDataSource<Visita>();

  monto = signal<number>(0)
  idFormaPago = signal<number>(0);
  idUsuario = signal<number>(0);
  openAddDialog = signal<number>(0);
  isLoading = signal<boolean>(false);

  isIdFormaPagoValid = computed(() => this.idFormaPago() > 0);
  isIdUsuarioValid = computed(() => this.idUsuario() > 0);
  isMontoValid = computed(() => this.monto() > 0);

  isFormValid = computed(
    () =>
      this.isIdFormaPagoValid() &&
      this.isMontoValid() &&
      this.isIdUsuarioValid()
  );

  lastKeyPressTime: number = 0;
  lastKey: string = '';
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleKeyDown(event);
    }
  }

async GetData() {
    this.isLoading.set(true)
    let resp = await this.getApi.GetVisita();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
    this.isLoading.set(false)
  }


  async clicEnviar() {
    if (this.isFormValid()) {
      const object: PagoPost = {
        fechaPago: new Date(),
        monto: this.monto(),
        idFormaDePago: this.idFormaPago(),
        estado: "COMPLETADO",
        idCliente: null,
        idUsuario: this.idUsuario(),
        tipoMovimientoAsociado: "INGRESO DIARIO",
        movimientoAsociadoID: null,
        observaciones: ""
      } as PagoPost;

      try {
        const resp = await firstValueFrom(this.postApi.postPago(object));
        if (resp) {
          this.alertSuccess("Se agregó correctamente");
          this.selectFormaPago().myControl.reset();
          this.resetFormulario();
          this.moveFocus("monto");
        }
      } catch (error) {
        this.errorService.manejarErroresApi(error);
      }
    }
  }


  eventFormaPago(id: number) {
    this.idFormaPago.set(id)
  }

  resetFormulario() {
    this.idFormaPago.set(0)
  }

  orderData() {
    this.idUsuario.set(this.authService.GetIdUsuario())
  }

  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddVisitaDialogComponent, {
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

  clickAddVisitaCliente() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddVisitaClienteDialogComponent, {
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

  clickViewDetalleVisita(obj: Visita) {
    let dial = this.dialog.open(ViewDetalleVisitaDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true,
      data: obj
    });

    dial.afterClosed().subscribe(async (resp) => {
    });
  }

  clickIngresoQr() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(ScanearQrEntradaDialogComponent, {
      width: '90%',
      maxWidth: '500px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        this.GetData();

      }
    });
  }

// ----------

  ngOnInit() {
    this.GetData()
    this.actualizarSuscripciones()
  }

  moveFocus(nextElementId: string) {
    let nextElement = document.getElementById(
      nextElementId
    ) as HTMLInputElement;
    if (nextElement) {
      nextElement.focus();
      nextElement.select();
    }
  }

  quitarFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur(); // Quita el enfoque del elemento activo
    }
  }

  alertSuccess(mensaje: string) {
    return Swal.fire({
      title: mensaje,
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    })
  }

  handleKeyDown(event: KeyboardEvent) {
    const currentTime = new Date().getTime();
    if (event.key === 'Enter') {
      if (currentTime - this.lastKeyPressTime < 300) {
        this.clicEnviar();
      }
    }
    this.lastKeyPressTime = currentTime;
    this.lastKey = event.key;
  }

  async actualizarSuscripciones(){
    try {
      let resp = await firstValueFrom(this.postApi.postActualizacionInscripciones())
    } catch (error) {
      this.errorService.manejarErroresApi(error);
    }
  }

}
