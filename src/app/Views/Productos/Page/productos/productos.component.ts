import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../../../../Components/loader/loader.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GetApiService } from '../../../../Services/get-api.service';
import { AlertsService } from '../../../../Services/alerts.service';
import { DeleteApiService } from '../../../../Services/delete-api.service';
import { Producto, ProductoPut } from '../../../../Interfaces/Producto';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from '../../../../Services/errors.service';
import { AddProductoDialogComponent } from '../../Dialog/add-producto-dialog/add-producto-dialog.component';
import { EditProductoDialogComponent } from '../../Dialog/edit-producto-dialog/edit-producto-dialog.component';
import { PutApiService } from '../../../../Services/put-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-productos',
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
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {

displayedColumns: string[] = [
  'nombre',
  'precio',
  'activo',
  'fecha',
  'acciones',
];

  api = inject(GetApiService);
  putApi = inject(PutApiService);
  alerts = inject(AlertsService);
  errorService = inject(ErrorsService);

  listaTotal = signal<Producto[]>([]);
  listaTabla = signal<Producto[]>([]);
  dataSource = new MatTableDataSource<Producto>();
  paginator = viewChild.required(MatPaginator);
  dialog = inject(MatDialog);

  openAddDialog = signal<number>(0);
  isLoading = signal<boolean>(false)

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '+' && this.openAddDialog() == 0) {
      this.clickAdd();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator()
  }

  async GetData() {
    this.isLoading.set(true)
    let resp = await this.api.GetProducto();
    this.listaTotal.set(resp);
    this.listaTabla.set(this.listaTotal());
    this.dataSource.data = this.listaTabla();
    this.isLoading.set(false)
  }

  clickAdd() {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(AddProductoDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        this.GetData();
      }
    });
  }

  clickEdit(object: Producto) {
    this.openAddDialog.set(1)
    let dial = this.dialog.open(EditProductoDialogComponent, {
      width: '100%',
      maxWidth: '1000px',
      disableClose: true,
      data: object
    });

    dial.afterClosed().subscribe(async (resp) => {
      this.openAddDialog.set(0)
      if (resp) {
        this.GetData();
      }
    });
  }


    async clicDesactivar(object: Producto, activo: boolean) {
    let result = await this.alerts.showAlertConfirmacionAnular();
    if (result) {
      let ob: ProductoPut = {
        id: object.id,
        nombre: object.nombre,
        precio: object.precio,
        fechaRegistro: new Date(),
        activo: activo,
        imagenUrl: ""
      };

      let resp = await firstValueFrom(this.putApi.putProducto(ob))
      if(resp){
        this.alerts.showAlertConfirmacion()
        this.GetData()
      }
    }
  }

  ngOnInit() {
    this.GetData();
  }

}
