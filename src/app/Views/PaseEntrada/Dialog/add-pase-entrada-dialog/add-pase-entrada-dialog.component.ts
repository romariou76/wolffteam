import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PostApiService } from '../../../../Services/post-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { firstValueFrom } from 'rxjs';
import { SelectClienteComponent } from '../../../Clients/Select/select-cliente/select-cliente.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectFormaPagoComponent } from '../../../Maestros/FormaPago/Select/select-forma-pago/select-forma-pago.component';
import { AuthService } from '../../../../Services/auth.service';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { EntradaPost } from '../../../../Interfaces/PaseEntrada/Entrada';
import { Pase, PaseEntradaRequest, PasePost } from '../../../../Interfaces/PaseEntrada/PaseEntrada';
import { ViewDetallesPaseEntradaDialogComponent } from '../view-detalles-pase-entrada-dialog/view-detalles-pase-entrada-dialog.component';
import { GetApiService } from '../../../../Services/get-api.service';
import { PrecioEntrada } from '../../../../Interfaces/Gestion/PrecioEntrada';

@Component({
  selector: 'app-add-pase-entrada-dialog',
 imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SelectClienteComponent,
    MatTableModule,
    SelectFormaPagoComponent,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
  ],
    providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './add-pase-entrada-dialog.component.html',
  styleUrl: './add-pase-entrada-dialog.component.css'
})
export class AddPaseEntradaDialogComponent {


  numeros: number[] = Array.from({ length: 30 }, (_, i) => i + 1);

  displayedColumns: string[] = [
    'producto',
    'cantidad',
    'precioUnitario',
    'precioTotal',
    'acciones'
  ];

  constructor(private dialogRef: MatDialogRef<AddPaseEntradaDialogComponent>) { }

  postApi = inject(PostApiService);
  getApi = inject(GetApiService);
  alerts = inject(AlertsService)
  authService = inject(AuthService)
  errorService = inject(ErrorsService)
  dialog = inject(MatDialog);

  openAddDetalleDialog = signal<number>(0);
  lastKeyPressTime: number = 0;
  lastKey: string = '';

  fechaRegistro = signal<Date>(new Date())
  idCliente = signal<number>(0);
  idUsuario = signal<number>(0);
  cantidadEntradas = signal<number>(0);
  total = signal<number>(0);
  entradas = signal<EntradaPost[]>([])
  idFormaPago = signal<number>(0);
  observaciones = signal<string>('');
  precioEntrada = signal<number>(0)
  isIdClienteValid = computed(() => this.idCliente() > 0);
  isIdUsuarioValid = computed(() => this.idUsuario() > 0);
  isIdFormaPagoValid = computed(() => this.idFormaPago() > 0);
  isTotalValid = computed(() => this.cantidadEntradas() > 0);
  isTotal2Valid = computed(() => this.total() > 0);
  isPrecioEntradaValid = computed(() => this.total() > 0);
  isEntradasValid = computed(() => this.entradas().length > 0);

  isFormValid = computed(
    () =>
      this.isIdClienteValid() &&
      this.isIdUsuarioValid() &&
      this.isIdFormaPagoValid() &&
      this.isTotalValid() &&
      this.isTotal2Valid() &&
      this.isPrecioEntradaValid() &&
      this.isEntradasValid()
  );

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if(this.openAddDetalleDialog() == 0) {
      event.preventDefault();
      this.handleKeyDown(event);
      }
    }
    if (event.key === 'Escape') {
      this.salirConConfirmacion();
    }
  }

  selectCantidad(value: number) {
    this.cantidadEntradas.set(value);
    this.generarEntradas()
  }

  eventCliente(id: number) {
    this.idCliente.set(id);
  }

  eventFormaPago(id: number) {
    this.idFormaPago.set(id);
  }

  generarEntradas(): void {
    this.entradas.set([])
    const fechaActual = new Date();

    let array: EntradaPost[] = []

    for (let i = 0; i < this.cantidadEntradas(); i++) {
      array.push({
        idCliente: this.idCliente(),
        usado: false,
        fecha: fechaActual,
      });
    }
    this.entradas.set([...array])
    this.setTotal()
  }

  setTotal() {
    const precioEntrada = this.precioEntrada();
    const cantidad = this.entradas().length;
    this.total.set(precioEntrada * cantidad);
  }

  actualizarTotal() {
    // if (this.entradas().length > 0) {
    //   let total: number = 0;
    //   this.entradas().forEach((element) => {
    //     total += element.detalle.precioTotal;
    //   });
    //   this.total.set(total);
    // } else {
    //   this.total.set(0);
    // }
  }


  async clicEnviar() {
    if (this.isFormValid()) {
      let result = await this.alerts.showConfirmacion();

      if (result) {
        let obj: PaseEntradaRequest = {
          paseEntrada: {
            idCliente: this.idCliente(),
            fecha: this.fechaRegistro(),
            total: this.total(),
            estado: "PROCESADO",
            cantidadComprada: this.cantidadEntradas(),
            cantidadRestante: this.cantidadEntradas(),
            idUsuario: this.idUsuario(),
            idFormaDePago: this.idFormaPago(),
            observaciones: this.observaciones() || '',
          } as PasePost,
          entradas: this.entradas()
        } as PaseEntradaRequest;

        console.log(obj);
        try {
          let resp = await firstValueFrom(this.postApi.postPaseEntrada(obj))
          if (resp) {
            this.alerts.showAlertConfirmacion()
            this.dialogRef.close(resp)
          }
        } catch (error) {
          this.errorService.manejarErroresApi(error)
        }
      }
    }
  }

  generarQR(){

  }

  ngOnInit() {
    this.getPrecioEntrada()
    this.idUsuario.set(Number(this.authService.GetIdUsuario()))
  }

  clickViewDetalles(object: Pase) {
    let dial = this.dialog.open(ViewDetallesPaseEntradaDialogComponent, {
      width: '100%',
      maxWidth: '1300px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {

    });
  }

  async getPrecioEntrada() {
    try {
      let resp = await (this.getApi.getPrecioEntrada())
      if (resp) {
        let obj: PrecioEntrada = resp
        this.precioEntrada.set(obj.precio || 0)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
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

  async salirConConfirmacion() {
    let result = await this.alerts.showAlertConfirmacionSalir();
    if (result) {
      this.dialogRef.close();
    } else {
      return;
    }
  }

}
