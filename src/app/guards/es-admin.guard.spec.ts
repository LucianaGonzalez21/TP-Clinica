import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { esAdminGuard } from './es-admin.guard';

describe('esAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => esAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
