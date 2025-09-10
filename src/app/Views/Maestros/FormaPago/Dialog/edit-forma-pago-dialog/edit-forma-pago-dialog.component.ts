import { Component, inject, Inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ErrorsService } from '../../../../../Services/errors.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { PutApiService } from '../../../../../Services/put-api.service';
import { FormaPago, FormaPagoPut } from '../../../../../Interfaces/FormaPago';

@Component({
  selector: 'app-edit-forma-pago-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-forma-pago-dialog.component.html',
  styleUrl: './edit-forma-pago-dialog.component.css'
})
export class EditFormaPagoDialogComponent {

putApi = inject(PutApiService)
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  constructor(
    public dialogRef: MatDialogRef<EditFormaPagoDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: FormaPago,
  ) { }

  formulario = new FormGroup({
    descripcion: new FormControl('', [Validators.required]),
  });

  async clicEnviar() {
    let object: FormaPagoPut = {
      id: this.data.id,
      descripcion: this.formulario.value.descripcion,
    } as FormaPagoPut
    try {
      let resp = await firstValueFrom(this.putApi.putFormaPago(object))
      if (resp) {
        this.alerts.alertSuccess("Se edito correctamente")
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }

  orderData() {
    this.formulario.patchValue({
      descripcion: this.data.descripcion,
    })
  }

  ngOnInit() {
    this.orderData()
  }


}
