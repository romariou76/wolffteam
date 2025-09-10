import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { firstValueFrom } from 'rxjs';
import { PostApiService } from '../../../../Services/post-api.service';
import { DeleteApiService } from '../../../../Services/delete-api.service';
import { SelectTipoDocumentoIdentidadComponent } from '../../../Maestros/TipoDocumentoIdentidad/Select/select-tipo-documento-identidad/select-tipo-documento-identidad.component';
import { SelectCargoComponent } from '../../../Maestros/Cargo/Select/select-cargo/select-cargo.component';
import { UsuarioPost } from '../../../../Interfaces/Usuario';

@Component({
  selector: 'app-add-usuario-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    SelectTipoDocumentoIdentidadComponent,
    SelectCargoComponent,
  ],
  templateUrl: './add-usuario-dialog.component.html',
  styleUrl: './add-usuario-dialog.component.css'
})
export class AddUsuarioDialogComponent {

 constructor(private dialogRef: MatDialogRef<AddUsuarioDialogComponent>) { }

  postApi = inject(PostApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)


  isDocumento = signal<boolean>(false)
  isRol = signal<boolean>(false)

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required]),
    direccion: new FormControl('', [Validators.required]),
    numeroDocumento: new FormControl('', [Validators.required]),
    idTipoDocumento: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    idCargo: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    password: new FormControl('', [Validators.required]),
    activo: new FormControl(true),
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+') {
      event.preventDefault();
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

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }


  eventTipoDocumento(id: number) {
    this.formulario.patchValue({
      idTipoDocumento: id
    });
  }

  eventCargo(id: number) {
    this.formulario.patchValue({
      idCargo: id
    });
  }


  async clicEnviar() {
    let object: UsuarioPost = {
      nombre: this.formulario.value.nombre,
      apellidos: this.formulario.value.apellidos,
      telefono: this.formulario.value.telefono,
      correo: this.formulario.value.correo,
      direccion: this.formulario.value.direccion,
      numeroDocumento: this.formulario.value.numeroDocumento,
      idTipoDocumento: this.formulario.value.idTipoDocumento,
      idCargo: this.formulario.value.idCargo,
      password: this.formulario.value.password,
      activo: this.formulario.value.activo,
      fechaRegistro: new Date(),
      fechaModificacion: new Date(),
    } as UsuarioPost
    try {
      let resp = await firstValueFrom(this.postApi.postUsuario(object))
      if (resp) {
        this.alerts.alertSuccess("Se registro correctamente")
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }

}
