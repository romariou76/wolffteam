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
import { ProductoPost } from '../../../../Interfaces/Producto';

@Component({
  selector: 'app-add-producto-dialog',
imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './add-producto-dialog.component.html',
  styleUrl: './add-producto-dialog.component.css'
})
export class AddProductoDialogComponent {

 constructor(private dialogRef: MatDialogRef<AddProductoDialogComponent>) { }

  postApi = inject(PostApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    precio: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
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

  async clicEnviar() {
    let object: ProductoPost = {
      nombre: (this.formulario.value.nombre || "").toUpperCase(),
      precio: this.formulario.value.precio,
      fechaRegistro: new Date(),
      activo: true,
      imagenUrl: ""
    } as ProductoPost
    try {
      let resp = await firstValueFrom(this.postApi.postProducto(object))
      if (resp) {
        this.alerts.alertSuccess("Se registro correctamente")
        this.dialogRef.close(resp)
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

}
