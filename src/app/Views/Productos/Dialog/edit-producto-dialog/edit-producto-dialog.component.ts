import { Component, inject, Inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { PutApiService } from '../../../../Services/put-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { Producto, ProductoPut } from '../../../../Interfaces/Producto';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-edit-producto-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSlideToggleModule
  ],
  templateUrl: './edit-producto-dialog.component.html',
  styleUrl: './edit-producto-dialog.component.css'
})
export class EditProductoDialogComponent {

  putApi = inject(PutApiService)
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)
  producto: Producto = {} as Producto;

  constructor(
    public dialogRef: MatDialogRef<EditProductoDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: Producto,
  ) {
    this.producto = data;
  }

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    precio: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    activo: new FormControl<boolean>(false, [Validators.required])
  });

 nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }

  async clicEnviar() {
    let object: ProductoPut = {
      id: this.producto.id,
      nombre: this.formulario.value.nombre,
      precio: this.formulario.value.precio,
      activo: this.formulario.value.activo,
      fechaRegistro: this.producto.fechaRegistro,
      imagenUrl: this.producto.imagenUrl,
    } as ProductoPut
    try {
      let resp = await firstValueFrom(this.putApi.putProducto(object))
      if (resp) {
        this.alerts.showAlertConfirmacion()
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }

  orderData() {
    this.formulario.patchValue({
      nombre: this.producto.nombre,
      precio: this.producto.precio,
      activo: this.producto.activo
    })
  }

  ngOnInit() {
    this.orderData()
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
