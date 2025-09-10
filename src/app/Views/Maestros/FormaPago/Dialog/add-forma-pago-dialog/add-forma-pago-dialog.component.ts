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
import { FormaPagoPost } from '../../../../../Interfaces/FormaPago';

@Component({
  selector: 'app-add-forma-pago-dialog',
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
  templateUrl: './add-forma-pago-dialog.component.html',
  styleUrl: './add-forma-pago-dialog.component.css'
})
export class AddFormaPagoDialogComponent {

  constructor(private dialogRef: MatDialogRef<AddFormaPagoDialogComponent>) { }

  postApi = inject(PostApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)
  isDocumento = signal<boolean>(false)
  isRol = signal<boolean>(false)

  formulario = new FormGroup({
    descripcion: new FormControl('', [Validators.required]),
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+') {
      event.preventDefault();
    }
  }

  async clicEnviar() {
    let object: FormaPagoPost = {
      descripcion: this.formulario.value.descripcion,
    } as FormaPagoPost
    try {
      let resp = await firstValueFrom(this.postApi.postFormaPago(object))
      if (resp) {
        this.alerts.alertSuccess("Se registro correctamente")
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }


}
