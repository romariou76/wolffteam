import { Component, HostListener, inject, signal } from '@angular/core';
import { PlanPost } from '../../../../Interfaces/Plan';
import { firstValueFrom } from 'rxjs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PostApiService } from '../../../../Services/post-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SelectFormaPagoComponent } from '../../../Maestros/FormaPago/Select/select-forma-pago/select-forma-pago.component';

@Component({
  selector: 'app-add-plan-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SelectFormaPagoComponent
  ],
  templateUrl: './add-plan-dialog.component.html',
  styleUrl: './add-plan-dialog.component.css'
})
export class AddPlanDialogComponent {

constructor(private dialogRef: MatDialogRef<AddPlanDialogComponent>) { }

  postApi = inject(PostApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)
  isDocumento = signal<boolean>(false)
  isRol = signal<boolean>(false)

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    precio: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    tipo: new FormControl('', [Validators.required]),
    duracionMeses: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+') {
      event.preventDefault();
    }
  }

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }



setTipoPlan() {
  let valor = this.formulario.get('duracionMeses')?.value;
  let duracion = Number(valor);
  let tipo = '';

  if (duracion === 0 || isNaN(duracion)) {
    this.formulario.patchValue({
      tipo: tipo
    })
    return;
  }

  switch (duracion) {
    case 1:
      tipo = 'Mensual';
      break;
    case 2:
      tipo = 'Bimestral';
      break;
    case 3:
      tipo = 'Trimestral';
      break;
    case 6:
      tipo = 'Semestral';
      break;
    case 12:
      tipo = 'Anual';
      break;
    default:
      tipo = '';
      break;
  }
  this.formulario.patchValue({
    tipo: tipo
  })
}


  async clicEnviar() {
    let object: PlanPost = {
      nombre: this.formulario.value.nombre,
      precio: this.formulario.value.precio,
      tipo: this.formulario.value.tipo,
      duracionMeses: this.formulario.value.duracionMeses,
      fechaCreacion: new Date(),
      activo: true
    } as PlanPost
    try {
      let resp = await firstValueFrom(this.postApi.postPlan(object))
      if (resp) {
        this.alerts.alertSuccess("Se registro correctamente")
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }


}
