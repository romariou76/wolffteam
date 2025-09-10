import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Genero } from '../../../../../Interfaces/Genero';

@Component({
  selector: 'app-select-genero',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './select-genero.component.html',
  styleUrl: './select-genero.component.css'
})
export class SelectGeneroComponent {

  readonly value = input<string>("");
  readonly event = output<string>();
  readonly validacion = input<boolean>(true);
  value2 = model<number>(0)

  myControl = new FormControl<string | Genero>('');
  listatabla = signal<Genero[]>([]);
  listatotal = signal<Genero[]>([
    {
    id: 1,
    descripcion: 'Masculino',
    abreviatura: 'M'
  },
  {
    id: 2,
    descripcion: 'Femenino',
    abreviatura: 'F'
  }
  ]);
  genero: Genero = {} as Genero;

  constructor() {
    this.changeValue()
    this.changeValue2()
  }

  async GetList() {
    this.listatabla.set(this.listatotal())
  }

  changeValue() {
    effect(async () => {
      const value = this.value()
      untracked(async () => {
        await this.GetList();
        let resp = this.listatotal().findIndex((p) => p.descripcion == value);
        this.myControl.setValue(this.listatotal()[resp]);
        this.genero = this.listatotal()[resp];
        this.submitEvent(this.genero)
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
          this.genero = resp;
          this.submitEvent(this.genero)
        }
      })

    })
  }


  submitEvent(value: Genero) {
    this.genero = value;
    this.value2.set(value.id)
    this.event.emit(value.descripcion);
  }

  displayFn(object: Genero) {
    return object && object.descripcion ? object.descripcion : '';
  }

  recarga(busqueda: string) {
    if (busqueda.trim() != '' && busqueda != null) {
      this.listatabla.set(
        this.listatotal().filter((p) =>
          p.descripcion.toUpperCase().includes(busqueda.toUpperCase())
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
        typeof value === 'string' ? value : value ? value.descripcion : '';
      this.recarga(busqueda.toUpperCase().trim());
    });
  }


}
