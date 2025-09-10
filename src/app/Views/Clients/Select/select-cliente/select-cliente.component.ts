import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GetApiService } from '../../../../Services/get-api.service';
import { Cliente } from '../../../../Interfaces/Cliente/Cliente';

@Component({
  selector: 'app-select-cliente',
 imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './select-cliente.component.html',
  styleUrl: './select-cliente.component.css'
})
export class SelectClienteComponent {

getapi = inject(GetApiService)

  readonly value = input<number>(0);
  readonly event = output<number>();
  readonly validacion = input<boolean>(true);
  // value2 = model<number>(0)

  myControl = new FormControl<string | Cliente>('');
  listatabla = signal<Cliente[]>([]);
  listatotal = signal<Cliente[]>([]);
  cliente: Cliente = {} as Cliente;

  constructor() {
    this.changeValue()
    // this.changeValue2()
  }

  async GetList() {
    let resp = await this.getapi.GetClientes();
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
        this.cliente = this.listatotal()[resp];
        this.submitEvent(this.cliente)
      })
    })
  }

  // changeValue2() {
  //   effect(async () => {
  //     const value = this.value2()
  //     untracked(async () => {
  //       await this.GetList();
  //       let resp = this.listatotal().find((p) => p.id == value);
  //       if (resp != undefined) {
  //         this.myControl.setValue(resp);
  //         this.cliente = resp;
  //         this.submitEvent(this.cliente)
  //       }
  //     })

  //   })
  // }


  submitEvent(value: Cliente) {
    this.cliente = value;
    // this.value2.set(value.id)
    this.event.emit(value.id);
  }

  displayFn(object: Cliente) {
    return object && object.nombre ? object.nombre + ' ' + object.apellidos + '-' + object.numeroDocumento : '' ;
  }

  recarga(busqueda: string) {
    if (busqueda.trim() != '' && busqueda != null) {
      this.listatabla.set(
        this.listatotal().filter((p) =>
          p.nombre.toUpperCase().includes(busqueda.toUpperCase()) ||
          p.apellidos.toUpperCase().includes(busqueda.toUpperCase()) ||
          p.numeroDocumento.toUpperCase().includes(busqueda.toUpperCase())
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
