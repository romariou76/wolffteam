
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { firstValueFrom } from 'rxjs';
import { PostApiService } from '../../../../Services/post-api.service';
import { DeleteApiService } from '../../../../Services/delete-api.service';
import { AuthService } from '../../../../Services/auth.service';
import { SelectClienteComponent } from '../../../Clients/Select/select-cliente/select-cliente.component';
import { SelectPlanComponent } from '../../../Planes/Select/select-plan/select-plan.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Suscripcion, SuscripcionPost } from '../../../../Interfaces/Suscripcion';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GetApiService } from '../../../../Services/get-api.service';
import { MatIconModule } from '@angular/material/icon';
import { AddClienteDialogComponent } from '../../../Clients/Dialog/add-cliente-dialog/add-cliente-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-add-suscripcion-dialog',
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
    SelectPlanComponent,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './add-suscripcion-dialog.component.html',
  styleUrl: './add-suscripcion-dialog.component.css'
})
export class AddSuscripcionDialogComponent {

  constructor(private dialogRef: MatDialogRef<AddSuscripcionDialogComponent>) { }

  getApi = inject(GetApiService);
  postApi = inject(PostApiService);
  authService = inject(AuthService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  selectPlan = viewChild.required(SelectPlanComponent);
  selectCliente = viewChild.required(SelectClienteComponent);
  dialog = inject(MatDialog);


  idCliente = signal<number>(0);

  lastKeyPressTime: number = 0;
  lastKey: string = '';
  openAddDialogCliente = signal<number>(0);
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
    fechaRegistro: new FormControl(new Date(), [Validators.required]),
    idCliente: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    idUsuario: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    idPlan: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    total: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
    fechaInicio: new FormControl(new Date(), [Validators.required]),
    fechaFin: new FormControl(new Date(), [Validators.required]),
    observaciones: new FormControl('', []),
  });

  nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isZero = control.value === 0;
      return isZero ? { 'nonZero': { value: control.value } } : null;
    };
  }

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



  async eventCliente(id: number) {
    let cliente = this.selectCliente().cliente
    let resp = await this.verificarSuscripcionCliente(id)
    if (resp > 0) {
      this.alerts.alertInfo(`${cliente.nombre} ya tiene una suscripción activa.`)
      this.formulario.patchValue({
        idCliente: 0
      });
    } else if (resp === 0) {
      this.formulario.patchValue({
        idCliente: id
      });
      this.moveFocus('selectplan')
    } else {
      // this.errorService.manejarErroresApi(resp)
    }
  }

  async verificarSuscripcionCliente(id: number): Promise<number> {
    try {
      let resp: Suscripcion = await firstValueFrom(this.getApi.getSuscripcionByIdCliente(id))
      if (resp.id) {
        return resp.id;
      } else {
        return 0
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error)
      return -1;
    }
  }

  eventPlan(id: number) {
    let plan = this.selectPlan().plan
    this.formulario.patchValue({
      idPlan: id,
      total: plan.precio
    });
    this.calcularFechasPorMeses()
  }

  calcularFechasPorMeses() {
    let cantidadMeses = this.selectPlan().plan.duracionMeses || 0;
    let fechaInicioValue = this.formulario.get('fechaInicio')?.value;
    let fechaInicio = fechaInicioValue ? new Date(fechaInicioValue) : new Date();

    const diasPorMes = 30;
    const totalDias = cantidadMeses * diasPorMes;

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + totalDias);

    console.log(fechaFin.toISOString().substring(0, 10));
    this.formulario.patchValue({
      fechaFin: fechaFin
    });
  }

  async clicEnviar() {
    if (this.formulario.valid && !this.isSending()) {
      this.isSending.set(true)
      const cliente = this.selectCliente().cliente
      const plan = this.selectPlan().plan;

      let object: SuscripcionPost = {
        idCliente: this.formulario.value.idCliente,
        codigo: "",
        idUsuario: this.formulario.value.idUsuario,
        idPlan: this.formulario.value.idPlan,
        total: this.formulario.value.total,
        totalPagado: 0,
        fechaRegistro: this.formulario.value.fechaRegistro,
        fechaInicio: this.formulario.value.fechaInicio,
        fechaFin: this.formulario.value.fechaFin,
        observaciones: this.formulario.value.observaciones,
        estado: "VIGENTE",
      } as SuscripcionPost
      //   setTimeout(() => {
      //   this.isSending.set(false)
      // }, 2000);
      try {
        let resp = await firstValueFrom(this.postApi.postSuscripcion(object))
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


  ngOnInit() {
    this.formulario.patchValue({
      idUsuario: this.authService.GetIdUsuario()
    })
    this.formulario.get('fechaInicio')?.valueChanges.subscribe(valor => {
      this.calcularFechasPorMeses();
    });
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


}
