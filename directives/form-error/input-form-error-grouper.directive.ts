import {
  AfterViewChecked,
  Directive,
  Input,
} from '@angular/core';

@Directive({
    selector: '[appInputFormErrorGrouper]',
    standalone: false
})
export class InputFormErrorGrouperDirective implements AfterViewChecked{

  @Input('appInputFormErrorGrouper') groupeName: string;
  hasError = false;

  constructor() {

  }

  ngAfterViewChecked(): void {
    this.hasError = false;
  }
}
