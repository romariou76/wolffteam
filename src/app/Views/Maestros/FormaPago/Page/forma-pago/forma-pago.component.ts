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
import { AddFormaPagoDialogComponent } from '../../Dialog/add-forma-pago-dialog/add-forma-pago-dialog.component';
import { EditFormaPagoDialogComponent } from '../../Dialog/edit-forma-pago-dialog/edit-forma-pago-dialog.component';
import { GetApiService } from '../../../../../Services/get-api.service';
import { PostApiService } from '../../../../../Services/post-api.service';
import { DeleteApiService } from '../../../../../Services/delete-api.service';
import { AlertsService } from '../../../../../Services/alerts.service';
import { FormaPago } from '../../../../../Interfaces/FormaPago';
import { ErrorsService } from '../../../../../Services/errors.service';


@Component({
  selector: 'app-forma-pago',
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
  templateUrl: './forma-pago.component.html',
  styleUrl: './forma-pago.component.css'
})
export class FormaPagoComponent {

displayedColumns: string[] = [
    'id',
    'descripcion',
    'opt'
  ];

  api = inject(GetApiService);
  postApi = inject(PostApiService)
  deleteApi = inject(DeleteApiService)
  alerts = inject(AlertsService);

  listaTotal = signal<FormaPago[]>([]);
  listaTabla = signal<FormaPago[]>([]);
  dataSource = new MatTableDataSource<FormaPago>();
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

    async GetFormaPago() {
      let resp = await this.api.getFormaPago();
      this.listaTotal.set(resp);
      this.listaTabla.set(this.listaTotal());
      this.dataSource.data = this.listaTabla();
    }

    clickAdd() {
      this.openAddDialog.set(1)
      let dial = this.dialog.open(AddFormaPagoDialogComponent, {
        width: '50%',
        maxWidth: '500px',
        disableClose: true
      });

      dial.afterClosed().subscribe(async (resp) => {
        this.openAddDialog.set(0)
        if (resp) {
          this.GetFormaPago();
        }
      });

    }

    clickEdit(object: FormaPago) {
      let dial = this.dialog.open(EditFormaPagoDialogComponent, {
        width: '100%',
        maxWidth: '800px',
        data: object,
      });

      dial.afterClosed().subscribe((result) => {
        this.GetFormaPago();
      });
    }

    async clicDelete(id: number) {
      try {
        let resp = await firstValueFrom(this.deleteApi.deleteFormaPago(id));
        if (resp) {
          this.alerts.alertSuccess('eliminado');
          this.GetFormaPago();
        }
      } catch (error) {
        this.errorService.manejarErroresApi(error);
      }
    }

    ngOnInit() {
      this.GetFormaPago();
    }


}
