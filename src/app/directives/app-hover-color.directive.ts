import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAppHoverColor]'
})
export class AppHoverColorDirective {

  constructor(private el: ElementRef) { }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.changeColor('cyan'); 
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.changeColor('white');
  }

  private changeColor(color: string) {
    this.el.nativeElement.style.color = color;
  }

}
