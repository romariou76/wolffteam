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
import { CargoPost } from '../../../../../Interfaces/Vendedor/Cargo';

@Component({
  selector: 'app-add-cargo-dialog',
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
  templateUrl: './add-cargo-dialog.component.html',
  styleUrl: './add-cargo-dialog.component.css'
})
export class AddCargoDialogComponent {

  constructor(private dialogRef: MatDialogRef<AddCargoDialogComponent>) { }

  postApi = inject(PostApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  formulario = new FormGroup({
    descripcion: new FormControl('', [Validators.required]),
    codigo: new FormControl(0, [Validators.required]),
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+') {
      event.preventDefault();
    }
  }

  async clicEnviar() {
    let object: CargoPost = {
      descripcion: this.formulario.value.descripcion,
      codigo: this.formulario.value.codigo,
    } as CargoPost
    try {
      let resp = await firstValueFrom(this.postApi.postCargo(object))
      if (resp) {
        this.alerts.alertSuccess("Se registro correctamente")
        this.dialogRef.close(resp)
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }
  }

}
