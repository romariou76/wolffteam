import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../../Components/loader/loader.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddTipoDocumentoIdentidadComponent } from '../../Dialog/add-tipo-documento-identidad/add-tipo-documento-identidad.component';
import { EditTipoDocumentoIdentidadComponent } from '../../Dialog/edit-tipo-documento-identidad/edit-tipo-documento-identidad.component';
import { GetApiService } from '../../../../../Services/get-api.service';
import { PostApiService } from '../../../../../Services/post-api.service';
import { DeleteApiService } from '../../../../../Services/delete-api.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { TipoDocumentoIdentidad } from '../../../../../Interfaces/Global/TipoDocumentoIdentidad';
import { ErrorsService } from '../../../../../Services/errors.service';

@Component({
  selector: 'app-tipo-documento-identidad',
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
  ],
  templateUrl: './tipo-documento-identidad.component.html',
  styleUrl: './tipo-documento-identidad.component.css'
})
export class TipoDocumentoIdentidadComponent {

displayedColumns: string[] = [
    'id',
    'nombre',
    'abreviatura',
    'opt'
  ];

  getApi = inject(GetApiService);
  postApi = inject(PostApiService)
  deleteApi = inject(DeleteApiService)
  alerts = inject(AlertsService);

  listaTotal = signal<TipoDocumentoIdentidad[]>([]);
  listaTabla = signal<TipoDocumentoIdentidad[]>([]);
  dataSource = new MatTableDataSource<TipoDocumentoIdentidad>();
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

    async GetCategoria() {
      let resp = await this.getApi.getTipoDocumento();
      this.listaTotal.set(resp);
      this.listaTabla.set(this.listaTotal());
      this.dataSource.data = this.listaTabla();
    }

    clickAdd() {
      this.openAddDialog.set(1)
      let dial = this.dialog.open(AddTipoDocumentoIdentidadComponent, {
        width: '50%',
        maxWidth: '500px',
        disableClose: true
      });

      dial.afterClosed().subscribe(async (resp) => {
        this.openAddDialog.set(0)
        if (resp) {
          this.GetCategoria();
        }
      });

    }

    clickEdit(object: TipoDocumentoIdentidad) {
      let dial = this.dialog.open(EditTipoDocumentoIdentidadComponent, {
        width: '100%',
        maxWidth: '800px',
        data: object,
      });

      dial.afterClosed().subscribe((result) => {
        this.GetCategoria();
      });
    }

    async clicDelete(id: number) {
      try {
        let resp = await firstValueFrom(this.deleteApi.deleteTipoDocumentoIdentidad(id));
        if (resp) {
          this.alerts.alertSuccess('Eliminado');
          this.GetCategoria();
        }
      } catch (error) {
        this.errorService.manejarErroresApi(error);
      }
    }

    ngOnInit() {
      this.GetCategoria();
    }

}
