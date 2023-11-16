import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaEspecialistaComponent } from './alta-especialista.component';

describe('AltaEspecialistaComponent', () => {
  let component: AltaEspecialistaComponent;
  let fixture: ComponentFixture<AltaEspecialistaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AltaEspecialistaComponent]
    });
    fixture = TestBed.createComponent(AltaEspecialistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
