import { Component, inject, signal } from '@angular/core';
import { PostApiService } from '../../../../../Services/post-api.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { ErrorsService } from '../../../../../Services/errors.service';
import { PutApiService } from '../../../../../Services/put-api.service';
import { GetApiService } from '../../../../../Services/get-api.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { PrecioIngresoPost } from '../../../../../Interfaces/Gestion/PrecioIngreso';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-set-precio-ingreso-dialog',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './set-precio-ingreso-dialog.component.html',
  styleUrl: './set-precio-ingreso-dialog.component.css'
})
export class SetPrecioIngresoDialogComponent {

  constructor(private dialogRef: MatDialogRef<SetPrecioIngresoDialogComponent>) { }

  postApi = inject(PostApiService);
  getApi = inject(GetApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  formulario = new FormGroup({
    precio: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
  });

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }

  async getData() {
    try {
      let resp = await (this.getApi.getPrecioIngreso())
      if (resp) {
        this.formulario.patchValue({
          precio: resp.precio,
        })
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }

  }

  async clicEnviar() {
    let object: PrecioIngresoPost = {
      precio: this.formulario.value.precio,
    } as PrecioIngresoPost
    try {
      let resp = await firstValueFrom(this.postApi.postPrecioIngreso(object))
      if (resp) {
        this.alerts.showAlertConfirmacion()
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }

  ngOnInit() {
    this.getData();
  }
}
