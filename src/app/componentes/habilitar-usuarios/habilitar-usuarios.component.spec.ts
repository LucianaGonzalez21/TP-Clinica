import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabilitarUsuariosComponent } from './habilitar-usuarios.component';

describe('HabilitarUsuariosComponent', () => {
  let component: HabilitarUsuariosComponent;
  let fixture: ComponentFixture<HabilitarUsuariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HabilitarUsuariosComponent]
    });
    fixture = TestBed.createComponent(HabilitarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
