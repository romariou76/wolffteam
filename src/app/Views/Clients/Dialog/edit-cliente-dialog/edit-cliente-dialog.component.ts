import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { Cliente, ClientePost, ClientePut } from '../../../../Interfaces/Cliente/Cliente';
import { AuthService } from '../../../../Services/auth.service';
import { GetApiService } from '../../../../Services/get-api.service';
import { DniDTO } from '../../../../Interfaces/Dni/DniDTO';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { PutApiService } from '../../../../Services/put-api.service';

@Component({
  selector: 'app-edit-cliente-dialog',
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
  templateUrl: './edit-cliente-dialog.component.html',
  styleUrl: './edit-cliente-dialog.component.css'
})
export class EditClienteDialogComponent {


  constructor(private dialogRef: MatDialogRef<EditClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA)private data: Cliente

  ) {
    this.cliente = data;
  }

  postApi = inject(PostApiService);
  putApi = inject(PutApiService);
  getApi = inject(GetApiService);
  authService = inject(AuthService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  lastKeyPressTime: number = 0;
  lastKey: string = '';

  isLoadingDni = signal<boolean>(false)

  cliente : Cliente = {} as Cliente;

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
    numeroDocumento: new FormControl('', [Validators.required]),
    idTipoDocumento: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    genero: new FormControl('', [Validators.required]),
    activo: new FormControl(false),
  });

  async getNombreByDni(){
    let numero = this.formulario.get('numeroDocumento')?.value || '';
    if(numero == ''){
      return;
    }
    this.isLoadingDni.set(true)
    try {
      let resp: DniDTO = await (this.getApi.getNombreByDni(numero))
      if(resp){
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

  idTipoDocumento = signal<number>(0);
  genero = signal<string>("");

 orderData(){
    this.formulario.patchValue({
      nombre: this.cliente.nombre,
      apellidos: this.cliente.apellidos,
      telefono: this.cliente.telefono,
      correo:this.cliente.correo,
      direccion: this.cliente.direccion,
      numeroDocumento: this.cliente.numeroDocumento,
      genero: this.cliente.genero,
      activo: this.cliente.activo,
    })

    this.idTipoDocumento.set(this.cliente.idTipoDocumento)
    this.genero.set(this.cliente.genero)
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
    if (this.formulario.valid) {
      let object: ClientePut = {
        id: this.cliente.id,
        nombre: this.formulario.value.nombre,
        apellidos: this.formulario.value.apellidos,
        numeroDocumento: this.formulario.value.numeroDocumento,
        idTipoDocumento: this.formulario.value.idTipoDocumento,
        idCreadoPor: this.cliente.idCreadoPor,
        genero: this.formulario.value.genero,
        telefono: this.formulario.value.telefono,
        correo: this.formulario.value.correo,
        direccion: this.formulario.value.direccion,
        activo: this.formulario.value.activo,
        fechaRegistro: this.cliente.fechaRegistro,
        fechaModificacion: new Date(),
        idModificadoPor: this.authService.GetIdUsuario(),
      } as ClientePost
      console.log(object)
      try {
        let resp = await firstValueFrom(this.putApi.putCliente(object))
        if (resp) {
          this.alerts.showAlertConfirmacion()
          this.dialogRef.close(resp)
        }
      } catch (error) {
        this.errorService.manejarErroresApi(error)
      }
    }
  }

  ngOnInit() {
    this.orderData()
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
