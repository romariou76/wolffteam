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
import { AddCargoDialogComponent } from '../../Dialog/add-cargo-dialog/add-cargo-dialog.component';
import { EditCargoDialogComponent } from '../../Dialog/edit-cargo-dialog/edit-cargo-dialog.component';
import { GetApiService } from '../../../../../Services/get-api.service';
import { PostApiService } from '../../../../../Services/post-api.service';
import { DeleteApiService } from '../../../../../Services/delete-api.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { ErrorsService } from '../../../../../Services/errors.service';
import { Cargo } from '../../../../../Interfaces/Vendedor/Cargo';

@Component({
  selector: 'app-cargo',
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
  templateUrl: './cargo.component.html',
  styleUrl: './cargo.component.css'
})
export class CargoComponent {

 displayedColumns: string[] = [
    'id',
    'descripcion',
    'codigo',
    'opt'
  ];

  dialog = inject(MatDialog);
  api = inject(GetApiService);
  postApi = inject(PostApiService)
  deleteApi = inject(DeleteApiService)
  alerts = inject(AlertsService);
  errorService = inject(ErrorsService);

  listaTotal = signal<Cargo[]>([]);
  listaTabla = signal<Cargo[]>([]);
  dataSource = new MatTableDataSource<Cargo>();
  paginator = viewChild.required(MatPaginator);

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

  async GetGenero() {
    let resp = await this.api.getCargo();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
  }

  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddCargoDialogComponent, {
      width: '50%',
      maxWidth: '500px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        this.GetGenero();
      }
    });

  }

  clickEdit(object: Cargo) {
    let dial = this.dialog.open(EditCargoDialogComponent, {
      width: '100%',
      maxWidth: '800px',
      data: object,
    });

    dial.afterClosed().subscribe((result) => {
      this.GetGenero();
    });
  }

  async clicDelete(id: number) {
    try {
      let resp = await firstValueFrom(this.deleteApi.deleteCargo(id));
      if (resp) {
        this.alerts.alertSuccess('eliminado');
        this.GetGenero();
      }
    } catch (error) {
      this.errorService.manejarErroresApi(error);
    }
  }

  ngOnInit() {
    this.GetGenero();
  }

}
