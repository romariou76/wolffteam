import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AlertsService } from '../../../../Services/alerts.service';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ErrorsService } from '../../../../Services/errors.service';
import { GetApiService } from '../../../../Services/get-api.service';
import { DeleteApiService } from '../../../../Services/delete-api.service';
import { Vendedor } from '../../../../Interfaces/Vendedor/Vendedor';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { Cliente } from '../../../../Interfaces/Cliente/Cliente';
import { AddClienteDialogComponent } from '../../Dialog/add-cliente-dialog/add-cliente-dialog.component';
import { EditClienteDialogComponent } from '../../Dialog/edit-cliente-dialog/edit-cliente-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-cliente',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent {

 displayedColumns: string[] = [
    'nombres',
    'apellidos',
    'numeroDocumento',
    'tipoDocumento',
    'telefono',
    'correo',
    // 'activo',
    'fechaRegistro',
    'Acciones',
  ];

  api = inject(GetApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService);

  listaTotal = signal<Cliente[]>([]);
  listaTabla = signal<Cliente[]>([]);
  dataSource = new MatTableDataSource<Cliente>();
  paginator = viewChild.required(MatPaginator);

  dialog = inject(MatDialog);
  errorService = inject(ErrorsService);

  openAddDialog = signal<number>(0);
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+' && this.openAddDialog() == 0) {
      this.clickAdd();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator()
  }

  async GetProductos() {
    let resp = await this.api.GetClientes();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
  }

  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddClienteDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        this.GetProductos();
      }
    });

  }

  clickEdit(object: Vendedor) {
    let dial = this.dialog.open(EditClienteDialogComponent, {
      width: '100%',
      maxWidth: '800px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {
      this.GetProductos();
    });
  }

  async clicDelete(id: number) {
    try {
      let resp = await firstValueFrom(this.deleteApi.DeleteProducto(id));
      if (resp) {
        this.alerts.alertSuccess('Producto eliminado');
        this.GetProductos();
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error);
    }
  }

  ngOnInit() {
    this.GetProductos();
  }


}
