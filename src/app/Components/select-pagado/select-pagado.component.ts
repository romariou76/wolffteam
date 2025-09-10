import { CommonModule } from '@angular/common';
import { Component, effect, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Pagado {
  id: number
  descripcion: string
}


@Component({
  selector: 'app-select-pagado',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './select-pagado.component.html',
  styleUrl: './select-pagado.component.css'
})
export class SelectPagadoComponent {

 readonly value = input<number>(0);
  readonly event = output<number>();

  myControl = new FormControl<string | Pagado>('');
  listatabla = signal<Pagado[]>([]);
  listatotal = signal<Pagado[]>([
    {
      id: 1,
      descripcion: 'PAGADO',
    },
    {
      id: 2,
      descripcion: 'NO PAGADO',
    },
     {
      id: 3,
      descripcion: 'TODOS',
    }
  ]);
  pagado: Pagado = {} as Pagado;

  constructor() {
    this.changeValue()
  }

  async GetList() {
    this.listatabla.set(this.listatotal())
  }

  changeValue() {
    effect(async () => {
      const value = this.value()
      untracked(async () => {
        await this.GetList();
        let resp = this.listatotal().findIndex((p) => p.id == value);
        this.myControl.setValue(this.listatotal()[resp]);
        this.pagado = this.listatotal()[resp];
        this.submitEvent(this.pagado)
      })
    })
  }

  submitEvent(value: Pagado) {
    this.pagado = value;
    this.event.emit(value.id);
  }

  displayFn(object: Pagado) {
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
