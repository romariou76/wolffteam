import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { Producto } from '../../../../Interfaces/Producto';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { GetApiService } from '../../../../Services/get-api.service';

@Component({
  selector: 'app-select-producto',
 imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './select-producto.component.html',
  styleUrl: './select-producto.component.css'
})
export class SelectProductoComponent {


getapi = inject(GetApiService)

  readonly value = input<number>(0);
  readonly event = output<number>();
  readonly validacion = input<boolean>(true);
  value2 = model<number>(0)

  myControl = new FormControl<string | Producto>('');
  listatabla = signal<Producto[]>([]);
  listatotal = signal<Producto[]>([]);
  producto: Producto = {} as Producto;

  constructor() {
    this.changeValue()
    this.changeValue2()
  }

  async GetList() {
    let resp = await this.getapi.GetProducto();
    this.listatotal.set(resp);
    this.listatabla.set(this.listatotal())
  }

  changeValue() {
    effect(async () => {
      const value = this.value()
      untracked(async () => {
        await this.GetList();
        let resp = this.listatotal().findIndex((p) => p.id == value);
        this.myControl.setValue(this.listatotal()[resp]);
        this.producto = this.listatotal()[resp];
        this.submitEvent(this.producto)
      })
    })
  }

  changeValue2() {
    effect(async () => {
      const value = this.value2()
      untracked(async () => {
        await this.GetList();
        let resp = this.listatotal().find((p) => p.id == value);
        if (resp != undefined) {
          this.myControl.setValue(resp);
          this.producto = resp;
          this.submitEvent(this.producto)
        }
      })

    })
  }


  submitEvent(value: Producto) {
    this.producto = value;
    this.value2.set(value.id)
    this.event.emit(value.id);
  }

  displayFn(object: Producto) {
    return object && object.nombre ? object.nombre : '' ;
  }

  recarga(busqueda: string) {
    if (busqueda.trim() != '' && busqueda != null) {
      this.listatabla.set(
        this.listatotal().filter((p) =>
          p.nombre.toUpperCase().includes(busqueda.toUpperCase())
        )
      );
    } else {
      this.listatabla.set(this.listatotal());
    }
  }

  ngOnInit() {
    this.GetList();
    this.myControl.valueChanges.subscribe((value) => {
      let busqueda: string =
        typeof value === 'string' ? value : value ? value.nombre : '';
      this.recarga(busqueda.toUpperCase().trim());
    });
  }


}
