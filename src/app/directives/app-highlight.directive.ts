import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAppHighlight]'
})
export class AppHighlightDirective {

  constructor(private eleRef: ElementRef) {
    eleRef.nativeElement.style.background = 'yellow';
    eleRef.nativeElement.style.color = 'black';
    eleRef.nativeElement.style.fontWeight = 'bold';
  }

}
