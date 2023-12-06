import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BienvenidaComponent } from './componentes/bienvenida/bienvenida.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { AltaPacienteComponent } from './componentes/alta-paciente/alta-paciente.component';
import { AltaEspecialistaComponent } from './componentes/alta-especialista/alta-especialista.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { ToastrModule } from 'ngx-toastr';
import { AngularFireModule } from '@angular/fire/compat';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from './componentes/nav-bar/nav-bar.component';
import { MatIconModule } from '@angular/material/icon'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AltaAdministradorComponent } from './componentes/alta-administrador/alta-administrador.component';
import { SeccionUsuariosComponent } from './componentes/seccion-usuarios/seccion-usuarios.component';
import { HabilitarUsuariosComponent } from './componentes/habilitar-usuarios/habilitar-usuarios.component';
import { MiPerfilComponent } from './componentes/mi-perfil/mi-perfil.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TurnoPacienteComponent } from './componentes/turno-paciente/turno-paciente.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { TurnosEspecialistaComponent } from './componentes/turnos-especialista/turnos-especialista.component';
import { TimeFormatPipe } from './pipes/time-format.pipe';
import { RecaptchaModule } from 'ng-recaptcha';
import { upperTextPipe } from './pipes/upperText.pipe';
import { PrimeraLetraMayusculaPipe } from './pipes/primera-letra-mayuscula.pipe';
import { SoundAlertDirective } from './directives/sound-alert.directive';
import { AppHighlightDirective } from './directives/app-highlight.directive';
import { AppHoverColorDirective } from './directives/app-hover-color.directive';
registerLocaleData(localeEs, 'es');


@NgModule({
  declarations: [
    AppComponent,
    BienvenidaComponent,
    LoginComponent,
    RegistroComponent,
    AltaPacienteComponent,
    AltaEspecialistaComponent,
    NavBarComponent,
    AltaAdministradorComponent,
    SeccionUsuariosComponent,
    HabilitarUsuariosComponent,
    MiPerfilComponent,
    TurnoPacienteComponent,
    TurnosEspecialistaComponent,
    TimeFormatPipe,
    upperTextPipe,
    PrimeraLetraMayusculaPipe,
    SoundAlertDirective,
    AppHighlightDirective,
    AppHoverColorDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RecaptchaModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    ToastrModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    NgxSpinnerModule,
  ],
  providers: [ { provide: LOCALE_ID, useValue: 'es-ES' },],
  bootstrap: [AppComponent]
})
export class AppModule { }
