import { CommonModule } from '@angular/common';
import { Component, Input, Provider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const FORM_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FormButtonToggleComponent),
  multi: true,
};

@Component({
  selector: 'app-form-button-toggle',
  standalone: true,
  templateUrl: './form-button-toggle.component.html',
  styleUrls: ['./form-button-toggle.component.scss'],
  providers: [FORM_CONTROL_VALUE_ACCESSOR],
  imports: [CommonModule]
})
export class FormButtonToggleComponent implements ControlValueAccessor {
  @Input() formControlData: string[] = [];
  selected: string = this.formControlData[0];
  @Input() disabled = false;
  private onChanged: (e: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() { }

  selectFormControl(value: string) {
    this.onTouched();
    this.selected = value;
    this.onChanged(value);
  }

  writeValue(value: string): void {
    this.selected = value;
    console.log(value);
  }
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

}
