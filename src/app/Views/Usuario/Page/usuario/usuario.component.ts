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
import { Usuario } from '../../../../Interfaces/Usuario';
import { AddUsuarioDialogComponent } from '../../Dialog/add-usuario-dialog/add-usuario-dialog.component';
import { EditUsuarioDialogComponent } from '../../Dialog/edit-usuario-dialog/edit-usuario-dialog.component';
import { LoaderComponent } from '../../../../Components/loader/loader.component';

@Component({
  selector: 'app-usuario',
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
  ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {

 displayedColumns: string[] = [
    'nombres',
    'numeroDocumento',
    'telefono',
    'cargo',
    'activo',
    'fechaRegistro',
    // 'Acciones',
  ];

  api = inject(GetApiService);
  deleteApi = inject(DeleteApiService);
  alerts = inject(AlertsService);

  listaTotal = signal<Usuario[]>([]);
  listaTabla = signal<Usuario[]>([]);
  dataSource = new MatTableDataSource<Usuario>();
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

  async GetUsuarios() {
    let resp = await this.api.GetUsuarios();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
  }

  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddUsuarioDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        this.GetUsuarios();
      }
    });

  }

  clickEdit(object: Usuario) {
    let dial = this.dialog.open(EditUsuarioDialogComponent, {
      width: '100%',
      maxWidth: '800px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {
      this.GetUsuarios();
    });
  }

  async clicDelete(id: number) {
    try {
      let resp = await firstValueFrom(this.deleteApi.DeleteProducto(id));
      if (resp) {
        this.alerts.alertSuccess('Usuario eliminado');
        this.GetUsuarios();
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error);
    }
  }

  ngOnInit() {
    this.GetUsuarios();
  }

}
