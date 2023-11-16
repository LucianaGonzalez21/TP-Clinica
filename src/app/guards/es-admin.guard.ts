import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { FirebaseService } from '../servicios/firebase.service';


export const esAdminGuard: CanActivateFn = (route, state) => {
  return inject(FirebaseService).esAdmin;
};
