import { Component, HostListener, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PostApiService } from '../../../../../Services/post-api.service';
import { DeleteApiService } from '../../../../../Services/delete-api.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { ErrorsService } from '../../../../../Services/errors.service';
import { TipoDocumentoIdentidadPost } from '../../../../../Interfaces/Global/TipoDocumentoIdentidad';

@Component({
  selector: 'app-add-tipo-documento-identidad',
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
  templateUrl: './add-tipo-documento-identidad.component.html',
  styleUrl: './add-tipo-documento-identidad.component.css'
})
export class AddTipoDocumentoIdentidadComponent {

 constructor(private dialogRef: MatDialogRef<AddTipoDocumentoIdentidadComponent>) { }

  postApi = inject(PostApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)
  isDocumento = signal<boolean>(false)
  isRol = signal<boolean>(false)

  formulario = new FormGroup({
    descripcion: new FormControl('', [Validators.required]),
    abreviatura: new FormControl('', [Validators.required]),
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+') {
      event.preventDefault();
    }
  }



  async clicEnviar() {
    let object: TipoDocumentoIdentidadPost = {
      descripcion: this.formulario.value.descripcion,
      abreviatura: this.formulario.value.abreviatura,
    } as TipoDocumentoIdentidadPost
    try {
      let resp = await firstValueFrom(this.postApi.postTipoDocumentoIdentidad(object))
      if (resp) {
        this.alerts.alertSuccess("Se registro correctamente")
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }


  }

}
