import { Component, inject, signal, viewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PostApiService } from '../../../../Services/post-api.service';
import { AuthService } from '../../../../Services/auth.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { SelectClienteComponent } from '../../../Clients/Select/select-cliente/select-cliente.component';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { GetApiService } from '../../../../Services/get-api.service';
import { firstValueFrom } from 'rxjs';
import { Suscripcion } from '../../../../Interfaces/Suscripcion';
import { MatCardModule } from '@angular/material/card';
import { Cliente } from '../../../../Interfaces/Cliente/Cliente';
import { VisitaPost } from '../../../../Interfaces/Gestion/Visita';

@Component({
  selector: 'app-add-visita-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    SelectClienteComponent,
    MatDatepickerModule,
    MatCardModule
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './add-visita-dialog.component.html',
  styleUrl: './add-visita-dialog.component.css'
})
export class AddVisitaDialogComponent {
  constructor(private dialogRef: MatDialogRef<AddVisitaDialogComponent>) { }

  postApi = inject(PostApiService);
  getApi = inject(GetApiService);
  authService = inject(AuthService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)
  selectCliente = viewChild.required(SelectClienteComponent);

  isInscrito = signal<boolean>(false);
  inscripcion: Suscripcion = {} as Suscripcion
  cliente: Cliente = {} as Cliente

  formulario = new FormGroup({
    idCliente: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    fecha: new FormControl(new Date(), [Validators.required]),
    observaciones: new FormControl('', []),
    inscrito: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    idUsuario: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
  });

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }

  async eventCliente(id: number) {
    this.cliente = this.selectCliente().cliente
    await this.verificarSuscripcionCliente(id)
    this.formulario.patchValue({
      idCliente: id,
    });
  }

  async verificarSuscripcionCliente(id: number) {
    try {
      let resp: Suscripcion = await firstValueFrom(this.getApi.getSuscripcionByIdCliente(id))
      if (resp.id) {
        this.isInscrito.set(true)
        this.formulario.patchValue({inscrito: resp.id})
        this.inscripcion = resp;
        this.moveFocus("fecha")
      } else {
        this.isInscrito.set(false)
        this.alerts.alertInfo(`${this.cliente.nombre} no tiene una inscripcion activa`)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }


  async clicEnviar() {
    if (this.formulario.valid) {
      let object: VisitaPost = {
        idCliente: this.formulario.get('idCliente')?.value,
        idInscripcion: this.inscripcion.id,
        tipo: "MENSUAL",
        fecha: this.formulario.get('fecha')?.value,
        idUsuario: this.formulario.get('idUsuario')?.value,
        observaciones: this.formulario.get('observaciones')?.value || '',
        costo: 0
      } as VisitaPost;
      try {
        let resp = await firstValueFrom(this.postApi.postVisita(object));
        if (resp) {
          this.alerts.showAlertConfirmacion()
          this.dialogRef.close(resp);
        }
      } catch (error) {
        this.errorService.manejarErroresApi(error);
      }
    }
  }

  ngOnInit() {
    this.formulario.patchValue({
      idUsuario: this.authService.GetIdUsuario()
    })
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


}
