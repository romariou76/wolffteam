import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { GetApiService } from '../../../../../Services/get-api.service';
import { FormaPago } from '../../../../../Interfaces/FormaPago';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-forma-pago',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './select-forma-pago.component.html',
  styleUrl: './select-forma-pago.component.css'
})
export class SelectFormaPagoComponent {

  getapi = inject(GetApiService)

  readonly value = input<number>(0);
  readonly event = output<number>();
  readonly validacion = input<boolean>(true);
  value2 = model<number>(0)

  myControl = new FormControl<string | FormaPago>('');
  listatabla = signal<FormaPago[]>([]);
  listatotal = signal<FormaPago[]>([]);
  formaPago: FormaPago = {} as FormaPago;

  constructor() {
    this.changeValue()
    this.changeValue2()
  }

  async GetList() {
    let resp = await this.getapi.getFormaPago();
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
        this.formaPago = this.listatotal()[resp];
        this.submitEvent(this.formaPago)
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
          this.formaPago = resp;
          this.submitEvent(this.formaPago)
        }
      })

    })
  }


  submitEvent(value: FormaPago) {
    this.formaPago = value;
    this.value2.set(value.id)
    this.event.emit(value.id);
  }

  displayFn(object: FormaPago) {
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
