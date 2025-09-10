import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectClienteComponent } from '../../../Clients/Select/select-cliente/select-cliente.component';
import { SelectPlanComponent } from '../../../Planes/Select/select-plan/select-plan.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '../../../../Interfaces/Global/FormatDate';
import { Suscripcion, SuscripcionPost, SuscripcionPut } from '../../../../Interfaces/Suscripcion';
import { PostApiService } from '../../../../Services/post-api.service';
import { AuthService } from '../../../../Services/auth.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { GetApiService } from '../../../../Services/get-api.service';
import { PutApiService } from '../../../../Services/put-api.service';
import { firstValueFrom } from 'rxjs';
import { InputComponent } from '../../../../Global/input-component/input-component';
import { Plan } from '../../../../Interfaces/Plan';

@Component({
  selector: 'app-edit-suscripcion-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    SelectPlanComponent,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatProgressSpinnerModule,
    InputComponent
  ],
  providers: [provideMomentDateAdapter(MY_DATE_FORMATS)],
  templateUrl: './edit-suscripcion-dialog.component.html',
  styleUrl: './edit-suscripcion-dialog.component.css'
})
export class EditSuscripcionDialogComponent {


  constructor(
    public dialogRef: MatDialogRef<EditSuscripcionDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: Suscripcion,
  ) {
    this.suscripcion.set(data)
  }

  getApi = inject(GetApiService);
  putApi = inject(PutApiService);
  authService = inject(AuthService);
  alerts = inject(AlertsService)
  errorService = inject(ErrorsService)

  selectPlan = viewChild.required(SelectPlanComponent);
  selectCliente = viewChild.required(SelectClienteComponent);
  dialog = inject(MatDialog);

  suscripcion = signal<Suscripcion>({} as Suscripcion)
  planOriginal = signal<Plan>({} as Plan)
  idPlan = signal<number>(0);
  cliente = signal<string>("");
  observaciones = signal<string>("");

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
    // idCliente: new FormControl(0, [Validators.required, this.nonZeroValidator()]),
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

  eventPlan(id: number) {
    let plan = this.selectPlan().plan
    // if(plan.duracionMeses < this.planOriginal().duracionMeses){
      // this.alerts.alertInfo("La duración en meses del plan seleccionado no puede ser menor que la duración original")
      // return;
    // }
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

      let object: SuscripcionPut = {
        id: this.data.id,
        idCliente: this.data.idCliente,
        idUsuario: this.data.idUsuario,
        idPlan: this.formulario.value.idPlan,
        plan: this.selectPlan().plan.nombre,
        total: this.formulario.value.total,
        totalPagado: this.data.totalPagado,
        pagado: this.data.pagado,
        fechaRegistro: this.formulario.value.fechaRegistro,
        fechaInicio: this.formulario.value.fechaInicio,
        fechaFin: this.formulario.value.fechaFin,
        observaciones: this.formulario.value.observaciones,
        estado: this.data.estado,
      } as SuscripcionPut
      try {
        let resp = await firstValueFrom(this.putApi.putSuscripcion(object))
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

  async searchPlanOriginal(){
    let resp = await firstValueFrom(this.getApi.getPlanById(this.data.idPlan))
    this.planOriginal.set(resp)
  }

 orderData() {
    this.formulario.patchValue({
      fechaRegistro: this.data.fechaRegistro,
      // idCliente: this.data.idCliente,
      idPlan: this.data.idPlan,
      total: this.data.total,
      fechaInicio: this.data.fechaInicio,
      fechaFin: this.data.fechaFin,
      observaciones: this.data.observaciones,
    })
    this.cliente.set(this.data.cliente)
    this.idPlan.set(this.data.idPlan);
    this.observaciones.set(this.data.observaciones)
    // this.searchPlanOriginal()
  }


  ngOnInit() {
    this.formulario.get('fechaInicio')?.valueChanges.subscribe(valor => {
      this.calcularFechasPorMeses();
    });
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


}
