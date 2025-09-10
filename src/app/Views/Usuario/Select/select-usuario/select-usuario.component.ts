import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GetApiService } from '../../../../Services/get-api.service';
import { Cliente } from '../../../../Interfaces/Cliente/Cliente';
import { Usuario, UsuarioDTOReporte } from '../../../../Interfaces/Usuario';

@Component({
  selector: 'app-select-usuario',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './select-usuario.component.html',
  styleUrl: './select-usuario.component.css'
})
export class SelectUsuarioComponent {


  getapi = inject(GetApiService)

  readonly value = input<number>(0);
  readonly event = output<number>();
  readonly validacion = input<boolean>(true);
  // value2 = model<number>(0)

  myControl = new FormControl<string | UsuarioDTOReporte>('');
  listatabla = signal<UsuarioDTOReporte[]>([]);
  listatotal = signal<UsuarioDTOReporte[]>([]);
  usuario: UsuarioDTOReporte = {} as UsuarioDTOReporte;

  constructor() {
    this.changeValue()
    // this.changeValue2()
  }

  async GetList() {
    let resp = await this.getapi.GetUsuarioDTOReporte();
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
        this.usuario = this.listatotal()[resp];
        this.submitEvent(this.usuario)
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


  submitEvent(value: UsuarioDTOReporte) {
    this.usuario = value;
    // this.value2.set(value.id)
    this.event.emit(value.id);
  }

  displayFn(object: Cliente) {
    return object && object.nombre ? object.nombre + ' ' + object.apellidos + '-' + object.numeroDocumento : '';
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
