import { Component, HostListener, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ErrorsService } from '../../../../Services/errors.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { PostApiService } from '../../../../Services/post-api.service';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Suscripcion } from '../../../../Interfaces/Suscripcion';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { PagoPost } from '../../../../Interfaces/Pago';
import { firstValueFrom } from 'rxjs';
import { SelectFormaPagoComponent } from '../../../Maestros/FormaPago/Select/select-forma-pago/select-forma-pago.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../../../Services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  selector: 'app-cobrar-suscripcion-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    SelectFormaPagoComponent,
    MatDatepickerModule,
    MatProgressSpinnerModule
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './cobrar-suscripcion-dialog.component.html',
  styleUrl: './cobrar-suscripcion-dialog.component.css'
})
export class CobrarSuscripcionDialogComponent {

  postApi = inject(PostApiService)
  authService = inject(AuthService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  suscripcion = signal<Suscripcion>({} as Suscripcion)

  lastKeyPressTime: number = 0;
  lastKey: string = '';
  isSending = signal<boolean>(false)
  totalInscripcion = signal<number>(0)

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+') {
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleKeyDown  (event);
    }
    if (event.key === 'Escape') {
      this.salirConConfirmacion();
    }
  }

  constructor(
    public dialogRef: MatDialogRef<CobrarSuscripcionDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: Suscripcion,
  ) {
    this.suscripcion.set(data)
  }

  formulario = new FormGroup({
    fechaPago: new FormControl(new Date(), [Validators.required]),
    monto: new FormControl(0, [Validators.required, this.nonZeroValidator(),this.validarMonto()]),
    idFormaDePago: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    observaciones: new FormControl(''),
    idUsuario: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
  });

  validarMonto(): ValidatorFn{
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isValid = control.value > this.suscripcion().total;
      return isValid ? { 'nonZero': { value: control.value } } : null;
    };
  }

  isValidMonto = signal<boolean>(true)
isMontoValid() {
  const monto = this.formulario.value.monto || 0;
  const total = this.suscripcion().total;
  const totalPagado = this.suscripcion().totalPagado;
  const saldo = total - totalPagado;

  if (totalPagado === 0) {
    this.isValidMonto.set(monto <= total);
  } else {
    this.isValidMonto.set(monto <= saldo);
  }
}


  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }

  async clicEnviar() {
  if (this.formulario.valid && !this.isSending()) {
      this.isSending.set(true)
    let object: PagoPost = {
      tipoMovimientoAsociado: "INSCRIPCION",
      movimientoAsociadoID: this.suscripcion().id,
      fechaPago: this.formulario.value.fechaPago,
      monto: this.formulario.value.monto,
      idFormaDePago: this.formulario.value.idFormaDePago,
      estado: "COMPLETADO",
      idCliente: this.suscripcion().idCliente,
      idUsuario: Number(this.formulario.value.idUsuario),
      observaciones: this.formulario.value.observaciones
    } as PagoPost
    try {
      let resp = await firstValueFrom(this.postApi.postPago(object))
      if (resp) {
        this.isSending.set(false)
        this.alerts.showAlertConfirmacion()
        this.dialogRef.close(resp)
      }
    } catch (error) {
        this.isSending.set(false)
      this.errorService.manejarErroresApi(error)
    }
       }
  }

  eventFormaPago(id: number){
    this.formulario.patchValue({
      idFormaDePago: id
    })
  }

  orderData() {
    this.formulario.patchValue({
      idUsuario: this.authService.GetIdUsuario()
      // descripcion: this.data.descripcion,
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

  async salirConConfirmacion() {
    let result = await this.alerts.showAlertConfirmacionSalir();
    if (result) {
      this.dialogRef.close();
    } else {
      return;
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

  ngOnInit() {
    this.orderData()

    this.formulario.get('monto')?.valueChanges.subscribe(valor => {
      this.isMontoValid();
    });
  }



}
