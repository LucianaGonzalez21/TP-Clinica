import { Component } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-turno-paciente',
  templateUrl: './turno-paciente.component.html',
  styleUrls: ['./turno-paciente.component.css']
})
export class TurnoPacienteComponent {
  public especialistaSeleccionado: any;
  public especialidadesSeleccionado: any;
  public especialidadSeleccionada: any;
  public diaSeleccionado: any;
  public cachedImages: { [key: string]: Promise<string> } = {};
  public especialistasTodos: any;
  public especialistas: any;
  public diasTurnos: any;
  public diaHorarios: any;
  public datosUsuario: any;
  private citasTodas: any;
  public pacienteSelecionadoPorAdmin: any;
  public pacientes: any;
  public listaEspecialidadesDisponibles: any;
  public duracionSelecionada: any;
  onover: boolean=false;
  
  constructor(private firebase: FirebaseService, private notificationS: NotificacionesService) { }

  async ngOnInit(): Promise<void> {

    let documento: any = await this.firebase.obtenerUsuarioDeBaseDeDatos();
    this.datosUsuario = documento.documento;

    await this.firebase.getCitas().subscribe((citas) => {
      if (citas.length > 0) {
        this.citasTodas = citas;
      } else {
        this.citasTodas = new Array();
      }
    });

    this.firebase.traerPacientes().subscribe((lista) => {
      this.pacientes = lista;
    });
    this.firebase.traerEspecialistas().subscribe((lista) => {
      let especialidades = lista.map((especialista: any) => especialista.especialidad);
      let especialidadesAplanadas = especialidades.flat();
      this.listaEspecialidadesDisponibles = especialidadesAplanadas.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
      this.especialistasTodos = lista;
    });

    this.diasTurnos = this.obtenerSiguientesQuinceDias();
  }

  onMouseOver() {
    this.onover = true;
   }
  
   onMouseOut() {
    this.onover = false;
   }
  async selecionadoPaciente(selecionadoPaciente: any) {
    this.pacienteSelecionadoPorAdmin = selecionadoPaciente;

  }
  obtenerImagenDeEspecialidad(especialidad:string){
    let imagenDeEspecialidad = "../../../assets/images-Especialidades/medical-team.png" ;
    switch (especialidad) {
      case "Cardiología":
        imagenDeEspecialidad = "../../../assets/images-Especialidades/cardiology.png" ;
        break;
      case "Pediatría":
        imagenDeEspecialidad = "../../../assets/images-Especialidades/pediatrics.png" ;
        break;
    }
    return imagenDeEspecialidad;
 
  }

  async selecionadoEspecialista(especialista: any) {
    this.diaSeleccionado = "";
    this.notificationS.showSpinner();
    try {
      this.especialistaSeleccionado = especialista;
      this.generarDiasDisponibles();
    } catch (error) {

    }
    finally {
      this.notificationS.hideSpinner();
    }

  }
  async selecionadoEspecialidad(especialidad: string) {
    this.especialistaSeleccionado = "";
    this.diaSeleccionado = "";
    this.especialidadSeleccionada = especialidad;
    this.firebase.traerEspecialistas().subscribe((lista) => {
      this.especialistas = lista.filter((especialista: any) => especialista.especialidad.includes(especialidad));
    });
  }


  generarDiasDisponibles() {
    this.notificationS.showSpinner();
    try {
      const diasDisponibles = this.obtenerSiguientesQuinceDias();
      if (this.diasTurnos.length > 0) {
        let diasFiltrados: any[] = [];
        diasDisponibles.forEach((dia: any) => {
          let diaVerificar = this.obtenerNombreDia(dia.getDay());
          let siTrabajo = this.especialistaSeleccionado.horario;
          siTrabajo = siTrabajo.filter((especialidad: any) => this.especialidadSeleccionada == especialidad);
          siTrabajo = siTrabajo.horario;
          console.log(siTrabajo);
          siTrabajo.forEach((diaTrabaja: { dia: string; activo: any; }) => {
            if (diaTrabaja.dia == diaVerificar && diaTrabaja.activo) {
              diasFiltrados.push(dia);
            }
          })
          this.diasTurnos = diasFiltrados;
        });
      } else {
        this.especialidadSeleccionada = "";
        //this.notificationS.showAlertDanger("Especialista Sin Horarios", "Este especialista no possee horarios abiertos para los siguientes 15 dias");
      }
    }
    catch {

    }
    finally {
      this.notificationS.hideSpinner();
    }
  }

  async selecionadoDia(dia: any) {
    this.diaSeleccionado = dia;
    //this.notificationS.showSpinner();
    let citas: any = new Array();
    let citasDBase: any = [];
    if (this.citasTodas.length > 0) {
      citasDBase = this.citasTodas?.filter((cita: any) => {
        return cita?.especialista.mail === this.especialistaSeleccionado.mail;
      });
    }
    let siTrabajo: any = this.especialistaSeleccionado.horario;

    interface Trabajo {
      dias: { jueves: boolean, martes: boolean, miercoles: boolean, lunes: boolean, viernes: boolean },
      especialidad: string,
      duracionMinutos: number
    }

    Object.entries(siTrabajo).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const trabajo = value as Trabajo;
        if (trabajo.especialidad === this.especialidadSeleccionada) {
          this.duracionSelecionada = trabajo.duracionMinutos;
        }
      }
    });

    try {
      let horarioDelDia = await this.divideDayIntoSegments(this.duracionSelecionada);
      citas = citasDBase;
      citas = citas.filter((cita:any) => {
        const timestampMilliseconds = cita.dia.seconds * 1000 + cita.dia.nanoseconds / 1e6;
        const fecha = new Date(timestampMilliseconds);
        let diaSeleccionado = new Date(this.diaSeleccionado.getFullYear(), this.diaSeleccionado.getMonth(), this.diaSeleccionado.getDate());
        return fecha.getDate() === diaSeleccionado.getDate() &&  fecha.getMonth() === diaSeleccionado.getMonth() &&  fecha.getFullYear() === diaSeleccionado.getFullYear();
      });
      const horariosOcupados = citas.map((turno: { horario: any; }) => turno.horario);
      const horariosDisponiblesFiltrados = horarioDelDia.filter(horario => !horariosOcupados.includes(horario));
      this.diaHorarios = horariosDisponiblesFiltrados;
    }
    catch {
    }
    finally {
      this.notificationS.hideSpinner();
    }
  }


  obtenerNombreDia(diaSemana: number): string {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábado'];
    return dias[diaSemana];
  }
  restarFechas(listaFechas: Date[], fechasARestar: Date[]): Date[] {
    const fechasRestantes = listaFechas.filter(fecha => !fechasARestar.some(fechaARestar => fecha.getTime() === fechaARestar.getTime()));
    return fechasRestantes;
  }


  divideDayIntoSegments(segmentDuration: number): string[] {
    const startHour = 8; // Start hour of the day
    const endHour = 19; // End hour of the day
    const segments: string[] = [];

    // Calculate the total number of segments based on the duration
    const totalSegments = Math.floor((endHour - startHour) * 60 / segmentDuration);

    // Iterate over the segments and calculate the start time for each segment
    for (let i = 0; i < totalSegments; i++) {
      const segmentStartHour = startHour + Math.floor(i * segmentDuration / 60);
      const segmentStartMinute = (i * segmentDuration) % 60;
      // Format the start time as a string with leading zeros if necessary
      const startTime = `${segmentStartHour.toString().padStart(2, '0')}:${segmentStartMinute.toString().padStart(2, '0')}`;
      // Calculate the end time by adding the segment duration to the start time
      const endTime = new Date(0, 0, 0, segmentStartHour, segmentStartMinute + segmentDuration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Add the time range to the segments array
      segments.push(`${startTime} - ${endTime}`);
    }
    return segments;
  }

  obtenerSiguientesQuinceDias(): Date[] {
    const listaFechas: Date[] = [];
    const hoy = new Date();

    for (let i = 0; i < 15; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);
      listaFechas.push(fecha);
    }

    return listaFechas;
  }
  async pedirCitaA(horario: any) {
    const especialidadDelTurno = this.especialidadSeleccionada;
    const cita = {
      especialista: this.especialistaSeleccionado,
      dia: this.diaSeleccionado,
      paciente: this.datosUsuario,
      horario: horario,
      estado: "sinAprobar",
      especialidadDelTurno: especialidadDelTurno
    }
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dia = cita.dia.toLocaleDateString('es-ES', opcionesFecha);

    if (await this.notificationS.showAlertPedirConfirmacion("Confirmacion de reserva de turno", "Esta seguro que desea el turno "
      + dia + " a las " + cita.horario + " con el doctor " + this.especialistaSeleccionado.nombre, "Confirmar Turno")) {
      this.firebase.altaCita(cita);
    }
    this.diaSeleccionado = "";
  }
  async pedirCitaComoAdmin(horario: any) {
    const especialidadDelTurno = this.especialistaSeleccionado.especialidad[this.especialidadSeleccionada];
    const cita = {
      especialista: this.especialistaSeleccionado,
      dia: this.diaSeleccionado,
      paciente: this.pacienteSelecionadoPorAdmin,
      horario: horario,
      estado: "sinAprobar",
      especialidadDelTurno: especialidadDelTurno
    }
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dia = cita.dia.toLocaleDateString('es-ES', opcionesFecha);
    if (await this.notificationS.showAlertPedirConfirmacion("Confirmacion de reserva de turno", "Esta seguro que desea el turno "
      + dia + " a las " + cita.horario + " con el doctor " + this.especialistaSeleccionado.nombre + " para el paciente " + cita.paciente.nombre + " " + cita.paciente.apellido, "Confirmar Turno")) {
      this.firebase.altaCita(cita);
    }
    this.diaSeleccionado = "";
  }

}
