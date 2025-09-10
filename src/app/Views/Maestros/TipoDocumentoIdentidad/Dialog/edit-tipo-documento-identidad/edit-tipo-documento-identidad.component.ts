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
import { TipoDocumentoIdentidad, TipoDocumentoIdentidadPut } from '../../../../../Interfaces/Global/TipoDocumentoIdentidad';

@Component({
  selector: 'app-edit-tipo-documento-identidad',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-tipo-documento-identidad.component.html',
  styleUrl: './edit-tipo-documento-identidad.component.css'
})
export class EditTipoDocumentoIdentidadComponent {


  putApi = inject(PutApiService)
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  constructor(
    public dialogRef: MatDialogRef<EditTipoDocumentoIdentidadComponent>, @Inject(MAT_DIALOG_DATA) private data: TipoDocumentoIdentidad,
  ) { }

  formulario = new FormGroup({
    descripcion: new FormControl('', [Validators.required]),
    abreviatura: new FormControl('', [Validators.required]),
  });

  async clicEnviar() {
    let object: TipoDocumentoIdentidadPut = {
      id: this.data.id,
      descripcion: this.formulario.value.descripcion,
      abreviatura: this.formulario.value.abreviatura,
    } as TipoDocumentoIdentidadPut
    try {
      let resp = await firstValueFrom(this.putApi.putTipoDocumentoIdentidad(object))
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
      abreviatura: this.data.abreviatura,
    })
  }

  ngOnInit() {
    this.orderData()
  }

}
