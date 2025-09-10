import { Component, inject, Inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { PutApiService } from '../../../../../Services/put-api.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { ErrorsService } from '../../../../../Services/errors.service';
import { Cargo, CargoPut } from '../../../../../Interfaces/Vendedor/Cargo';

@Component({
  selector: 'app-edit-cargo-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-cargo-dialog.component.html',
  styleUrl: './edit-cargo-dialog.component.css'
})
export class EditCargoDialogComponent {

  putApi = inject(PutApiService)
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  constructor(
    public dialogRef: MatDialogRef<EditCargoDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: Cargo,
  ) { }

  formulario = new FormGroup({
    descripcion: new FormControl('', [Validators.required]),
    codigo: new FormControl(0, [Validators.required]),
  });

  async clicEnviar() {
    let object: CargoPut = {
      id: this.data.id,
      descripcion: this.formulario.value.descripcion,
      codigo: this.formulario.value.codigo,
    } as CargoPut
    try {
      let resp = await firstValueFrom(this.putApi.putCargo(object))
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
      codigo: this.data.codigo,
    })
  }

  ngOnInit() {
    this.orderData()
  }

}
