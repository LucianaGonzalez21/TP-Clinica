import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {

  transform(value: string): string {
    const [start, end] = value.split(' - ');
    const [startHour, startMinute] = start.split(':');
    const [endHour, endMinute] = end.split(':');
 
    const startPeriod = Number (startHour) >= 12 ? 'pm' : 'am';
    const endPeriod = Number (endHour) >= 12 ? 'pm' : 'am';
 
    const formattedStartHour = Number (startHour) % 12 || 12;
    const formattedEndHour = Number (endHour) % 12 || 12;
 
    return `${formattedStartHour}:${startMinute} ${startPeriod} - ${formattedEndHour}:${endMinute} ${endPeriod}`;
  }
}
