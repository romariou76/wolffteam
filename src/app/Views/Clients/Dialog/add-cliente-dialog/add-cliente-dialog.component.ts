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
import { SelectGeneroComponent } from '../../../Maestros/Genero/Select/select-genero/select-genero.component';
import { ClientePost } from '../../../../Interfaces/Cliente/Cliente';
import { AuthService } from '../../../../Services/auth.service';
import { GetApiService } from '../../../../Services/get-api.service';
import { DniDTO } from '../../../../Interfaces/Dni/DniDTO';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-cliente-dialog',
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
    SelectGeneroComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-cliente-dialog.component.html',
  styleUrl: './add-cliente-dialog.component.css'
})
export class AddClienteDialogComponent {

  constructor(private dialogRef: MatDialogRef<AddClienteDialogComponent>) { }

  postApi = inject(PostApiService);
  getApi = inject(GetApiService);
  authService = inject(AuthService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  lastKeyPressTime: number = 0;
  lastKey: string = '';

  isLoadingDni = signal<boolean>(false)
  isSending = signal<boolean>(false)

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+') {
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleKeyDown(event);
    }
    if (event.key === 'Escape') {
      this.salirConConfirmacion();
    }
  }

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required]),
    correo: new FormControl(''),
    direccion: new FormControl(''),
    numeroDocumento: new FormControl(''),
    // numeroDocumento: new FormControl('', [Validators.required]),
    idTipoDocumento: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    genero: new FormControl('', [Validators.required]),
    idCreadoPor: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    activo: new FormControl(true),
  });

  async getNombreByDni() {
    let numero = this.formulario.get('numeroDocumento')?.value || '';
    if (numero == '') {
      return;
    }
    this.isLoadingDni.set(true)
    try {
      let resp: DniDTO = await (this.getApi.getNombreByDni(numero))
      if (resp) {
        this.formulario.patchValue({
          nombre: resp.nombres,
          apellidos: resp.apellidoPaterno + " " + resp.apellidoMaterno
        })
        this.moveFocus("nombre")
        this.isLoadingDni.set(false)
      }
    } catch (error) {
      this.isLoadingDni.set(false)
      this.errorService.manejarErroresApi(error)
    }
  }


  eventTipoDocumento(id: number) {
    this.formulario.patchValue({
      idTipoDocumento: id
    });
  }

  eventGenero(genero: string) {
    this.formulario.patchValue({
      genero: genero
    });
  }

  async clicEnviar() {
    if (this.formulario.valid && !this.isSending()) {
      this.isSending.set(true)
      let object: ClientePost = {
        nombre: (this.formulario.value.nombre || "" ).toUpperCase(),
        apellidos: (this.formulario.value.apellidos || "").toUpperCase(),
        numeroDocumento: this.formulario.value.numeroDocumento,
        idTipoDocumento: this.formulario.value.idTipoDocumento,
        idCreadoPor: this.formulario.value.idCreadoPor,
        genero: this.formulario.value.genero,
        telefono: this.formulario.value.telefono,
        correo: this.formulario.value.correo,
        direccion: this.formulario.value.direccion || "",
        activo: this.formulario.value.activo,
        fechaRegistro: new Date(),
        fechaModificacion: new Date(),
      } as ClientePost
          // this.dialogRef.close(object)

      try {
        let resp = await firstValueFrom(this.postApi.postCliente(object))
        if (resp) {
          this.alerts.showAlertConfirmacion()
          this.dialogRef.close(resp)
          this.isSending.set(false)
        }
      } catch (error) {
        this.isSending.set(false)
        this.errorService.manejarErroresApi(error)
      }
    }
  }

capitalizarNombres(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .filter(p => p.trim().length > 0)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}


  ngOnInit() {
    console.log(this.authService.GetIdUsuario())
    this.formulario.patchValue({
      idCreadoPor: this.authService.GetIdUsuario()
    })
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

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }


}
