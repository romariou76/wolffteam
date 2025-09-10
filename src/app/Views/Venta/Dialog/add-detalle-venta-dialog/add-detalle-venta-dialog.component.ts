import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SelectProductoComponent } from '../../../Productos/Select/select-producto/select-producto.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DetalleVenta, DetalleVentaPost } from '../../../../Interfaces/Gestion/Venta';

interface Detalle {
  detalle: DetalleVentaPost;
  productodescripcion: string;
}


@Component({
  selector: 'app-add-detalle-venta-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    SelectProductoComponent,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './add-detalle-venta-dialog.component.html',
  styleUrl: './add-detalle-venta-dialog.component.css'
})
export class AddDetalleVentaDialogComponent {


  producto = signal<number>(0);
  selectProducto = viewChild.required(SelectProductoComponent);
  lastKeyPressTime: number = 0;
  lastKey: string = '';

  formulario = new FormGroup({
    idProducto: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    cantidad: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    precioUnitario: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    precioTotal: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '-') {
      this.dialogRef.close();
    }
      if (event.key === 'Enter') {
      event.preventDefault();
      this.handleKeyDown(event);
    }
  }

  constructor(
    public dialogRef: MatDialogRef<AddDetalleVentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: number
  ) {
  }

  eventProducto(id: number) {
    let producto = this.selectProducto().producto;
    let cantidad = this.formulario.get('cantidad')?.value || 0;
    this.formulario.patchValue({
      idProducto: id,
      precioUnitario: producto.precio,
      precioTotal: producto.precio * cantidad
    });
  }

  calculoTotal() {
    let cantidad = this.formulario.get('cantidad')?.value || 0;
    let precio = this.formulario.get('precioUnitario')?.value || 0;
    this.formulario.patchValue({
      precioUnitario: precio,
      precioTotal: precio * cantidad
    });
  }


  clicEnviar() {
    if (this.formulario.valid) {

      let detalle: Detalle = {
        detalle: {
          idProducto: this.formulario.get('idProducto')?.value || 0,
          cantidad: this.formulario.get('cantidad')?.value || 0,
          precioUnitario: this.formulario.get('precioUnitario')?.value || 0,
          precioTotal: this.formulario.get('precioTotal')?.value || 0
        } as DetalleVentaPost,
        productodescripcion: this.selectProducto().producto.nombre,
      };

      this.dialogRef.close(detalle);
    }
  }

  moveFocus(nextElementId: string) {
    if (nextElementId == 'cantidad') {
      // if (this.producto() == 0) {
      //   nextElementId = 'selectproveedorproducto';
      // }
    }
    let nextElement = document.getElementById(
      nextElementId
    ) as HTMLInputElement;
    if (nextElement) {
      nextElement.focus();
      nextElement.select();
    }
  }

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
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


  quitarFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur(); // Quita el enfoque del elemento activo
    }
  }

}
