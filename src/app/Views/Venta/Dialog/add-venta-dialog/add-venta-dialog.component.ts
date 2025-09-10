import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PostApiService } from '../../../../Services/post-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { ErrorsService } from '../../../../Services/errors.service';
import { DetalleVenta, DetalleVentaPost, VentaDetalles, VentaPost } from '../../../../Interfaces/Gestion/Venta';
import { firstValueFrom } from 'rxjs';
import { SelectClienteComponent } from '../../../Clients/Select/select-cliente/select-cliente.component';
import { AddDetalleVentaDialogComponent } from '../add-detalle-venta-dialog/add-detalle-venta-dialog.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectFormaPagoComponent } from '../../../Maestros/FormaPago/Select/select-forma-pago/select-forma-pago.component';
import { AuthService } from '../../../../Services/auth.service';

interface Detalle {
  detalle: DetalleVentaPost;
  productodescripcion: string;
}

@Component({
  selector: 'app-add-venta-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SelectClienteComponent,
    MatTableModule,
    SelectFormaPagoComponent
  ],
  templateUrl: './add-venta-dialog.component.html',
  styleUrl: './add-venta-dialog.component.css'
})
export class AddVentaDialogComponent {

  displayedColumns: string[] = [
    'producto',
    'cantidad',
    'precioUnitario',
    'precioTotal',
    'acciones'
  ];

  constructor(private dialogRef: MatDialogRef<AddVentaDialogComponent>) { }

  postApi = inject(PostApiService);
  alerts = inject(AlertsService)
  authService = inject(AuthService)
  errorService = inject(ErrorsService)
  dialog = inject(MatDialog);

  detalles: DetalleVenta[] = [];
  openAddDetalleDialog = signal<number>(0);
  lastKeyPressTime: number = 0;
  lastKey: string = '';

  idCliente = signal<number>(0);
  idUsuario = signal<number>(0);
  idFormaPago = signal<number>(0);
  observaciones = signal<string>('');
  total = signal<number>(0);
  isIdClienteValid = computed(() => this.idCliente() > 0);
  isIdUsuarioValid = computed(() => this.idUsuario() > 0);
  isIdFormaPagoValid = computed(() => this.idFormaPago() > 0);
  isTotalValid = computed(() => this.total() > 0);
  detallesVenta = signal<Detalle[]>([]);
  dataSource = new MatTableDataSource<Detalle>();
  isDetallesValid = computed(() => {
    const lista = this.detallesVenta();
    let total = 0
    if (lista.length > 0) {
      return true;
    } else {
      return false;
    }
  });
  isFormValid = computed(
    () =>
      this.isIdClienteValid() &&
      this.isIdUsuarioValid() &&
      this.isIdFormaPagoValid() &&
      this.isDetallesValid() &&
      this.isTotalValid()
  );

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+' && this.openAddDetalleDialog() == 0) {
      event.preventDefault();
      this.clickAddDetalle();
    }
    if (event.key === 'Enter') {
      if(this.openAddDetalleDialog() == 0) {
      event.preventDefault();
      this.handleKeyDown(event);
      }
    }
    if (event.key === 'Escape') {
      this.salirConConfirmacion();
    }
  }

  eventCliente(id: number) {
    this.idCliente.set(id);
  }

  eventFormaPago(id: number) {
    this.idFormaPago.set(id);
  }

  clickAddDetalle() {
    this.openAddDetalleDialog.set(1)
    let dial = this.dialog.open(AddDetalleVentaDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true
    });

    dial.afterClosed().subscribe((result) => {
      if (result) {
        let object: Detalle = result;
        object.detalle.idVenta = 0;

        let tabl: Detalle[] = this.detallesVenta();
        tabl.push(object);
        this.detallesVenta.set([...tabl]);
        this.dataSource.data = this.detallesVenta();
        this.actualizarTotal()
      }
      this.openAddDetalleDialog.set(0)
    });
  }

  actualizarTotal() {
    if (this.detallesVenta().length > 0) {
      let total: number = 0;
      this.detallesVenta().forEach((element) => {
        total += element.detalle.precioTotal;
      });
      this.total.set(total);
    } else {
      this.total.set(0);
    }
  }


  clicDelete(id: number) {
    let resp = this.detallesVenta().filter(
      (p) => p.detalle.idProducto != id
    );
    this.detallesVenta.set(resp);
    this.dataSource.data = this.detallesVenta();
    this.actualizarTotal()
  }

  async clicEnviar() {
    if (this.isFormValid()) {
      let result = await this.alerts.showConfirmacion();

      if (result) {
        let venta: VentaDetalles = {
          venta: {
            idCliente: this.idCliente(),
            fechaRegistro: new Date(),
            estado: "PROCESADO",
            total: this.total(),
            idUsuario: this.idUsuario(),
            idFormaDePago: this.idFormaPago(),
            observaciones: this.observaciones() || '',
          } as VentaPost,
          detalles: this.detallesVenta().map((d) => d.detalle)
        } as VentaDetalles;

        console.log(venta);
        try {
          let resp = await firstValueFrom(this.postApi.postVenta(venta))
          if (resp) {
            this.alerts.showAlertConfirmacion()
            this.dialogRef.close(resp)
          }
        } catch (error) {
          this.errorService.manejarErroresApi(error)
        }
      }
    }
  }

  ngOnInit() {
    this.idUsuario.set(Number(this.authService.GetIdUsuario()))
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

  quitarFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur(); // Quita el enfoque del elemento activo
    }
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

}
