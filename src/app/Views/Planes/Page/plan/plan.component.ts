import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { GetApiService } from '../../../../Services/get-api.service';
import { PostApiService } from '../../../../Services/post-api.service';
import { DeleteApiService } from '../../../../Services/delete-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { Plan } from '../../../../Interfaces/Plan';
import { ErrorsService } from '../../../../Services/errors.service';
import { AddPlanDialogComponent } from '../../Dialog/add-plan-dialog/add-plan-dialog.component';
import { EditPlanDialogComponent } from '../../Dialog/edit-plan-dialog/edit-plan-dialog.component';
import { PutApiService } from '../../../../Services/put-api.service';

@Component({
  selector: 'app-plan',
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
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.css'
})
export class PlanComponent {

  getApi = inject(GetApiService);
  postApi = inject(PostApiService)
  putApi = inject(PutApiService)
  deleteApi = inject(DeleteApiService)
  alerts = inject(AlertsService);

  listaTotal = signal<Plan[]>([]);
  listaTabla = signal<Plan[]>([]);
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



    async GetFormaPago() {
      let resp = await this.getApi.getPlan();
      this.listaTotal.set(resp);
      this.listaTabla.set(this.listaTotal());
    }

    clickAdd() {
      this.openAddDialog.set(1)
      let dial = this.dialog.open(AddPlanDialogComponent, {
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

    clickEdit(object: Plan) {
      let dial = this.dialog.open(EditPlanDialogComponent, {
        width: '100%',
        maxWidth: '800px',
        data: object,
        disableClose: true

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

    async clickActualizarEstado(id: number, estado: boolean){
      try {
        let resp = await firstValueFrom(this.putApi.putEstadoPlan(id, estado));
        if (resp) {
          this.alerts.alertSuccess('Actualizado');
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
