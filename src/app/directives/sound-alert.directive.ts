import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appSoundAlert]'
})
export class SoundAlertDirective {

  constructor(private el: ElementRef) { }

 @HostListener('mouseenter')
 onMouseEnter() {
   let audio = new Audio();
   audio.src = "../../../assets/audiomass-output.mp3";
   audio.load();
   audio.play();
 }

}
