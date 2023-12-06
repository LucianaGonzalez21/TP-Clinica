import { trigger, transition, style, query, animate, group } from '@angular/animations';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* => Alta', [
        query(':enter, :leave',
          style({ position: 'fixed', width: '100%', height: '100%' }),
          { optional: true }
        ),
        group([
          query(':enter', [
            style({ opacity: 0 }),
            animate('0.5s ease-in-out',
              style({ opacity: 1 })
            )
          ], { optional: true }),
          query(':leave', [
            style({ opacity: 1 }),
            animate('0.5s ease-in-out',
              style({ opacity: 0 })
            )
          ], { optional: true }),
        ])
      ]),
      transition('* <=> *', [
        query(':enter, :leave',
          style({ position: 'fixed', width: '100%', height: '100%' }),
          { optional: true }
        ),
        group([
          query(':enter', [
            style({ transform: 'translateX(100%)' }),
            animate('0.5s ease-in-out',
              style({ transform: 'translateX(0%)' })
            )
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out',
              style({ transform: 'translateX(-100%)' })
            )
          ], { optional: true }),
        ])
      ]),
    ])
  ]

})
export class AppComponent {
  title = 'TpClinica';
  outlet: any;
  constructor(private router: Router) {
  }

  prepareRoute(outlet: RouterOutlet) {
    this.outlet = outlet;
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
