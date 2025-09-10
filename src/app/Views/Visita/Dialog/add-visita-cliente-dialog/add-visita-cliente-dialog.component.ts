import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectClienteComponent } from '../../../Clients/Select/select-cliente/select-cliente.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SelectFormaPagoComponent } from '../../../Maestros/FormaPago/Select/select-forma-pago/select-forma-pago.component';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { PostApiService } from '../../../../Services/post-api.service';
import { GetApiService } from '../../../../Services/get-api.service';
import { AuthService } from '../../../../Services/auth.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { Suscripcion } from '../../../../Interfaces/Suscripcion';
import { firstValueFrom } from 'rxjs';
import { VisitaPost } from '../../../../Interfaces/Gestion/Visita';
import { MatIconModule } from '@angular/material/icon';
import { AddClienteDialogComponent } from '../../../Clients/Dialog/add-cliente-dialog/add-cliente-dialog.component';

@Component({
  selector: 'app-add-visita-cliente-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    SelectClienteComponent,
    MatDatepickerModule,
    SelectFormaPagoComponent,
    MatIconModule
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './add-visita-cliente-dialog.component.html',
  styleUrl: './add-visita-cliente-dialog.component.css'
})
export class AddVisitaClienteDialogComponent {


  constructor(private dialogRef: MatDialogRef<AddVisitaClienteDialogComponent>) { }

  postApi = inject(PostApiService);
  getApi = inject(GetApiService);

  authService = inject(AuthService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  selectCliente = viewChild.required(SelectClienteComponent);
  isDocumento = signal<boolean>(false)
  isRol = signal<boolean>(false)
  lastKeyPressTime: number = 0;
  lastKey: string = '';


  // detallesAsistencia = signal<DetalleAsistencia[]>([])

  horaActual = new Date().toLocaleTimeString();


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
    idCliente: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    fecha: new FormControl(new Date(), [Validators.required]),
    costo: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    idFormaPago: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    observaciones: new FormControl('', []),
    idUsuario: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
  });

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }


  async eventCliente(id: number) {
    await this.verificarSuscripcionCliente(id)
  }

  async eventFormaPago(id: number) {
    this.formulario.patchValue({
      idFormaPago: id,
    });
  }

  openAddDialogCliente = signal<number>(0);
  dialog = inject(MatDialog);
  mostrarSelect = signal<boolean>(true);
  idCliente = signal<number>(0);

  clickAddClienteDialog() {
    this.openAddDialogCliente.set(1)
    let dial = this.dialog.open(AddClienteDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialogCliente.set(0)
      if (resp) {
        const nuevaLista = [...this.selectCliente().listatotal(), resp];
        this.selectCliente().listatotal.set(nuevaLista);
        this.selectCliente().listatabla.set(nuevaLista);
        this.selectCliente().GetList();

        this.idCliente.set(resp.id);

        // this.idCliente.set(resp.id);
      }
    });
  }


  async verificarSuscripcionCliente(id: number) {
    let resp: Suscripcion = await firstValueFrom(this.getApi.getSuscripcionByIdCliente(id))
    if (resp.id) {
      this.alerts.alertInfo("El cliente tiene una inscripcion activa, registra el ingreso como cliente");
      this.formulario.patchValue({
        idCliente: 0,
      });
    } else {
      this.formulario.patchValue({
        idCliente: id,
      });
      this.moveFocus("fecha")

    }
  }


  async clicEnviar() {
    if (this.formulario.valid) {
      let object: VisitaPost = {
        idCliente: this.formulario.get('idCliente')?.value,
        idInscripcion: null,
        tipo: "VISITA OCASIONAL",
        fecha: this.formulario.get('fecha')?.value,
        idUsuario: this.formulario.get('idUsuario')?.value,
        observaciones: this.formulario.get('observaciones')?.value || '',
        idFormaDePago: this.formulario.get('idFormaPago')?.value || null,
        costo: this.formulario.get('costo')?.value || 0,
      } as VisitaPost;
      try {
        let resp = await firstValueFrom(this.postApi.postVisita(object));
        if (resp) {
          this.alerts.showAlertConfirmacion()
          this.dialogRef.close(resp);
        }
      } catch (error) {
        this.errorService.manejarErroresApi(error);
      }
    }
  }


  ngOnInit() {
    this.getPrecioIngreso()
    this.formulario.patchValue({
      idUsuario: this.authService.GetIdUsuario()
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

  async getPrecioIngreso() {
    try {
      let resp = await (this.getApi.getPrecioIngreso())
      if (resp) {
        this.formulario.patchValue({
          costo: resp.precio,
        })
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
    }

  }


  quitarFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur(); // Quita el enfoque del elemento activo
    }
  }


}
