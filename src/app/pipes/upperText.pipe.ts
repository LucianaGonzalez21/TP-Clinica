import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperText'
})
export class upperTextPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.toUpperCase();
  }

}
