import { Component } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import { Chart, BarElement, BarController, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent {
  listaLogs: any[] = [];
  listaTurnos: any[] = [];
  private logsSubscription!: Subscription;
  private turnosSubscription!: Subscription;
  //@ts-ignore
  chartPorEspecialidad: any;


  banderaChartSolicitados: boolean = true;
  banderaChartFinalizados = true;

  //directivas

  constructor(private firestore: FirebaseService, private datePipe: DatePipe, private notificacionesS: NotificacionesService) {
    Chart.register(BarElement, BarController, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, ChartDataLabels);
    Chart.register(...registerables);
  }

  fechaDeHoy(): string {
    const currentDate = new Date();
    return this.datePipe.transform(currentDate, 'yyyy-MM-dd HH:mm') || '';
  }

  ngOnInit(): void {
    this.logsSubscription = this.firestore.getLogs().subscribe((logs: any) => {
      this.listaLogs = logs;
    });

    this.turnosSubscription = this.firestore.getCitas().subscribe((turnos) => {
      this.listaTurnos = turnos;

      this.generarChartClienteHumor();
      this.generarChartTurnosPorDia();
      this.generarChartTurnosSolicitadosPorMedico();
      this.generarChartTurnosFinalizadosPorMedico();
    });
}


  ngOnDestroy(): void {
    this.logsSubscription.unsubscribe();
    this.turnosSubscription.unsubscribe();
  }

  // LOGS DE USUARIOS
  descargarPDFLogs() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdflogs');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };

    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Calculate number of pages needed
        const pagesNeeded = Math.ceil(pdfHeight / doc.internal.pageSize.getHeight());

        // Loop over each page and insert image
        for (let i = 0; i < pagesNeeded; i++) {
          // Make sure we don't add a new page on the first iteration
          if (i !== 0) {
            doc.addPage();
          }

          const startHeight = pdfWidth * i;

          doc.addImage(
            img,
            'PNG',
            0, // x coord
            -startHeight, // y coord
            pdfWidth,
            pdfHeight
          );
        }

        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`logs_usuarios.pdf`);
      });
  }

  descargarExcelLogs() {
    let listaMapeada = this.listaLogs.map(log => {
      return {
        fecha: log.fecha,
        perfil: log.usuario.tipoUsuario,
        nombre: log.usuario.nombre,
        apellido: log.usuario.apellido,
      }
    });
    this.exportAsExcelFile(listaMapeada, 'logUsuarios');
  }


  private crearArrayTurnosPorEspecialidad(){
    let ocurrenciasPorEspecialidad:any = {};

    this.listaTurnos.forEach(turno => {
      let especialidad = turno.especialidadDelTurno;
      ocurrenciasPorEspecialidad[especialidad] = (ocurrenciasPorEspecialidad[especialidad] || 0) + 1;
    })

    const arrayFinal = Object.entries(ocurrenciasPorEspecialidad).map(([especialidad, ocurrencias]) => [especialidad, ocurrencias]);

    console.log(arrayFinal);
    return arrayFinal;
  }

  // CHART CANTIDAD DE TURNOS POR ESPECIALIDAD
  generarChartClienteHumor() {
    const ctx = (<any>(
      document.getElementById('turnosPorEspecialidad')
    )).getContext('2d');

    const colors = [
      '#1f77b4', // Azul
      '#ff7f0e', // Naranja
      '#2ca02c', // Verde
      '#d62728', // Rojo
      '#9467bd', // Púrpura
      '#8c564b', // Marrón
      '#e377c2',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    let listaTurnos = this.crearArrayTurnosPorEspecialidad();

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: listaTurnos.map((especialidad:any) => especialidad[0]),
        datasets: [
          {
            label: undefined,
            data: listaTurnos.map((especialidad:any) => especialidad[1]),
            backgroundColor: turnosColores,
            borderColor: ['#fff'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          title: {
            display: true,
            color: '#fff',
            font: {
              size: 20,
            }
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarPDFTurnosPorEspecialidad() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosPorEspecialidad');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnos_por_especialidad.pdf`);
      });
  }

  descargarExcelTurnosPorEspecialidad() {
    this.exportAsExcelFile(this.crearArrayTurnosPorEspecialidad(), 'turnosPorEspecialidad');
  }

  // CHART CANTIDAD DE TURNOS POR DIA
  generarChartTurnosPorDia() {
    const ctx = (<any>document.getElementById('turnosPorDia')).getContext('2d');

    const colors = [  
    '#1f77b4', // Azul
    '#ff7f0e', // Naranja
    '#2ca02c', // Verde
    '#d62728', // Rojo
    '#9467bd', // Púrpura
    '#8c564b', // Marrón
    '#e377c2',
    '#17becf',
  ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    let listaTurnosPorDia = [0, 0, 0, 0, 0, 0, 0];
    this.listaTurnos.forEach((t) => {
      if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 1) {
        listaTurnosPorDia[0]++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 2) {
        listaTurnosPorDia[1]++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 3) {
        listaTurnosPorDia[2]++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 4) {
        listaTurnosPorDia[3]++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 5) {
        listaTurnosPorDia[4]++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 6) {
        listaTurnosPorDia[5]++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 0) {
        listaTurnosPorDia[6]++;
      } 
    });

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
        datasets: [
          {
            label: undefined,
            data: listaTurnosPorDia,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 0,

          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 15,
        },
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },

          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarPDFTurnosPorDia() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosPorDia');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnos_por_dia.pdf`);
      });
  }

  descargarExcelTurnosPorDia() {
    const listaTurnosPorDia = [
      {
        Fecha: new Date(),
        Lunes: 0,
        Martes: 0,
        Miercoles: 0,
        Jueves: 0,
        Viernes: 0,
        Sabado: 0,
        Domingo: 0
      },
    ];
    this.listaTurnos.forEach((t) => {
      if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 1) {
        //@ts-ignore
        listaTurnosPorDia[0].Lunes++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 2) {
        //@ts-ignore
        listaTurnosPorDia[0].Martes++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 3) {
        //@ts-ignore
        listaTurnosPorDia[0].Miercoles++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 4) {
        //@ts-ignore
        listaTurnosPorDia[0].Jueves++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 5) {
        //@ts-ignore
        listaTurnosPorDia[0].Viernes++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 6) {
        //@ts-ignore
        listaTurnosPorDia[0].Sabado++;
      } else if ((new Date(t.dia.seconds * 1000 + t.dia.nanoseconds / 1000000)).getDay() == 0) {
        //@ts-ignore
        listaTurnosPorDia[0].Domingo++;
      }
    });
    this.exportAsExcelFile(listaTurnosPorDia, 'turnosPorDia');
  }

  private crearArrayCantidadTurnosSegunEspecialista(){
    let ocurrenciasPorEspecialista:any = {};

    this.listaTurnos.forEach(turno => {
      let especialista = turno.especialista.nombre + " " + turno.especialista.apellido;
      ocurrenciasPorEspecialista[especialista] = (ocurrenciasPorEspecialista[especialista] || 0) + 1;
    })

    const arrayFinal = Object.entries(ocurrenciasPorEspecialista).map(([especialista, ocurrencias]) => [especialista, ocurrencias]);

    console.log(arrayFinal);
    return arrayFinal;
  }

  // CHART CANTIDAD DE TURNOS SOLICITADOS POR MEDICO
  generarChartTurnosSolicitadosPorMedico() {
    const ctx = (<any>(
      document.getElementById('turnosSolicitadosPorMedico')
    )).getContext('2d');

    const colors = [
      '#1f77b4', // Azul
      '#ff7f0e', // Naranja
      '#2ca02c', // Verde
      '#d62728', // Rojo
      '#9467bd', // Púrpura
      '#8c564b', // Marrón
      '#e377c2',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );
    let listaTurnosSolicitadosPorMedico = this.crearArrayCantidadTurnosSegunEspecialista();

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: listaTurnosSolicitadosPorMedico.map((turno:any) => turno[0]),
        datasets: [
          {
            label: undefined,
            data: listaTurnosSolicitadosPorMedico.map((turno:any) => turno[1]),
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },
          title: {
            display: true,
            color: '#fff',
            font: {
              size: 20,
            }
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarPDFTurnosSolicitadosPorMedico() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosSolicitadosPorMedico');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnosSolicitadosPorMedico.pdf`);
      });
  }

  descargarExcelTurnosSolicitadosPorMedico() {
    this.exportAsExcelFile(
      this.crearArrayCantidadTurnosSegunEspecialista(),
      'turnosSolicitadosPorMedico'
    );
  }

  filtrarTurnosPorDias(cantidadDias: number) {
    this.banderaChartSolicitados = false;

    setTimeout(() => {
      this.banderaChartSolicitados = true;
      setTimeout(() => {
        const currentDate = new Date();
        const futureDate = new Date(
          currentDate.getTime() + 84600000 * cantidadDias
        );
        const listadoFiltrado: any[] = [];
        this.listaTurnos.forEach((t) => {
          if (
            new Date(t.dia).getTime() <=
            futureDate.getTime() &&
            t.estado == 'sinAprobar'
          ) {
            listadoFiltrado.push(t);
          }
        });
        console.log(this.listaTurnos)
        console.log(listadoFiltrado)
        this.generarChartTurnosSolicitadosPorMedico();
      }, 500);
    }, 100);
  }

  private crearArrayCantidadTurnosFinalizadosSegunEspecialista(){
    let ocurrenciasPorEspecialista:any = {};

    let turnosFinalizados = this.listaTurnos.filter((turno:any) => {return turno.estado == 'finalizado' || turno.estado == 'realizado'})

    turnosFinalizados.forEach(turno => {
      let especialista = turno.especialista.nombre + " " + turno.especialista.apellido;
      ocurrenciasPorEspecialista[especialista] = (ocurrenciasPorEspecialista[especialista] || 0) + 1;
    })

    const arrayFinal = Object.entries(ocurrenciasPorEspecialista).map(([especialista, ocurrencias]) => [especialista, ocurrencias]);

    console.log(arrayFinal);
    return arrayFinal;
  }

  // CHART CANTIDAD DE TURNOS FINALIZADOS POR MEDICO
  generarChartTurnosFinalizadosPorMedico() {
    const ctx = (<any>(
      document.getElementById('turnosFinalizadosPorMedico')
    )).getContext('2d');

    const colors = [
      '#1f77b4', // Azul
      '#ff7f0e', // Naranja
      '#2ca02c', // Verde
      '#d62728', // Rojo
      '#9467bd', // Púrpura
      '#8c564b', // Marrón
      '#e377c2',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    let listaTurnosFinalizadosPorMedico = this.crearArrayCantidadTurnosFinalizadosSegunEspecialista();

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: listaTurnosFinalizadosPorMedico.map((turno:any) => turno[0]),
        datasets: [
          {
            label: undefined,
            data: listaTurnosFinalizadosPorMedico.map((turno:any) => turno[1]),
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },
          title: {
            display: true,
            color: '#fff',
            font: {
              size: 20,
            }
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  descargarExcelTurnosFinalizadosPorMedico() {
    this.exportAsExcelFile(
      this.crearArrayCantidadTurnosFinalizadosSegunEspecialista(),
      'turnosFinalizadosPorMedico'
    );
  }

  descargarPDFTurnosFinalizadosPorMedico() {
    this.notificacionesS.showSpinner();
    const DATA = document.getElementById('pdfTurnosFinalizadosPorMedico');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      })
      .then((docResult) => {
        this.notificacionesS.hideSpinner();
        docResult.save(`turnosFinalizadosPorMedico.pdf`);
      });
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
}
