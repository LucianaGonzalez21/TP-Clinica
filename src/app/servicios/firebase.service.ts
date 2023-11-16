import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { NotificacionesService } from './notificaciones.service';
import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import { formatDate } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { where } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private nombre: string = "";
  private apellido: string = "";
  public esAdmin: boolean = false;
  public estaLogueado: boolean = false;
  private emailUsuarioLogueado:string='';
  //admin
  //private emailUsuarioLogueado: string = 'amelumia@gmail.com';
  //paciente 1
  //  private emailUsuarioLogueado: string = 'veihuwoummanau-5987@yopmail.com';
  //especialista 1
  //private emailUsuarioLogueado: string = 'hiddabahola-7537@yopmail.com';

  public get Nombre(): string {
    return this.nombre;
  }

  public get Apellido(): string {
    return this.apellido;
  }

  constructor(private authenticator: AngularFireAuth, private firestore: AngularFirestore, private storage: AngularFireStorage, private notificaciones: NotificacionesService) { }

  registrarUsuario(usuario: any, tipo: string) {
    return this.authenticator.createUserWithEmailAndPassword(usuario.mail, usuario.clave).then((data) => {
      const uid = data.user?.uid
      let documento: any;

      switch (tipo) {
        case "especialista":
          documento = this.firestore.doc("especialistas/" + uid);
          break;
        case "paciente":
          documento = this.firestore.doc("pacientes/" + uid);
          break;
        case "admin":
          documento = this.firestore.doc("administradores/" + uid);
          break;
      }

      documento.set({
        uid: uid,
        ...usuario
      })
      data.user?.sendEmailVerification();
    }).catch(error => {
      this.mensajeError(error.code)
    })
  }

  private mensajeError(mensaje: string) {
    switch (mensaje) {
      case 'auth/user-not-found':
        this.notificaciones.mostrarError('El usuario no se encuentra registrado', "ERROR", 3000, "toast-center-center");
        break;
      case 'auth/wrong-password':
        this.notificaciones.mostrarError('La contraseña es incorrecta', "ERROR", 3000, "toast-center-center");
        break;
      case 'auth/internal-error':
        this.notificaciones.mostrarError('Los campos estan vacios', "ERROR", 3000, "toast-center-center");
        break;
      case 'auth/operation-not-allowed':
        this.notificaciones.mostrarError('La operación no está permitida.', "ERROR", 3000, "toast-center-center");
        break;
      case 'auth/email-already-in-use':
        this.notificaciones.mostrarError('El email ya está registrado.', "ERROR", 3000, "toast-center-center");
        break;
      case 'auth/invalid-email':
        this.notificaciones.mostrarError('El email no es valido.', "ERROR", 3000, "toast-center-center");
        break;
      case 'auth/weak-password':
        this.notificaciones.mostrarError('La contraseña debe tener al menos 6 caracteres', "ERROR", 3000, "toast-center-center");
        break;
      default:
        this.notificaciones.mostrarError('Error', "ERROR", 3000, "toast-center-center");
        break;
    }
  }

  async ingresarConMailYClave(email: string, clave: string): Promise<boolean | undefined> {
    this.emailUsuarioLogueado = email;
    let retorno: boolean | undefined;
    await this.authenticator.signInWithEmailAndPassword(email, clave).then((data) => {
      retorno = data.user?.emailVerified;
    });

    return retorno;
  }

  salir() {
    this.esAdmin = false;
    this.estaLogueado = false;
    this.emailUsuarioLogueado = '';
    return this.authenticator.signOut();
  }
  getCitas() {
    return this.firestore.collection('citas').valueChanges();
  }
  traerEspecialistas() {
    return this.firestore.collection('especialistas').valueChanges();
  }

  traerPacientes() {
    return this.firestore.collection('pacientes').valueChanges();
  }

  traerAdministradores() {
    return this.firestore.collection('administradores').valueChanges();
  }

  traerEspecialidades() {
    return this.firestore.collection('especialidades').valueChanges();
  }

  agregarEspecialidad(coleccionEspecialidades: any) {
    return this.firestore.collection('especialidades').doc(coleccionEspecialidades.id).update({ especialidades: coleccionEspecialidades.especialidades })
  }

  async subirFotoAlStorage(input: HTMLInputElement) {
    const archivo = input.files;
    if (archivo) {
      const foto = archivo[0];
      const filePath = "fotos/" + uuidv4();
      const snapshot = await this.storage.upload(filePath, foto);
      return getDownloadURL(snapshot.ref);
    }
    return null;
  }

  // mofificarHabilitacionEspecialista(emailEspecialista:string, dato: any) {
  //   const query = this.firestore.collection('especialistas', ref => ref.where("mail", "==", emailEspecialista).limit(1));

  //   return query.get().toPromise().then((querySnapShot: any) => {
  //     if (!querySnapShot.empty) {
  //       const idDocumento = querySnapShot.docs[0].id;


  //       const referenciaDocumento = this.firestore.collection('especialistas').doc(idDocumento);

  //       let data = {
  //         ...querySnapShot.docs[0].data,
  //         estaHabilitado: dato
  //       }

  //       return referenciaDocumento.update(data);
  //     } else {
  //       console.log('No se encontró ningún documento con el atributo y valor especificado.');
  //       return Promise.reject();
  //     }
  //   }).catch((error) => {
  //     console.error('Error al modificar el documento:', error);
  //     return Promise.reject(error);
  //   });
  // }

  /*NUEVO*/

  modificarObjetoPorAtributo(coleccion: string, uidObjeto: string, atributo: string, valor: any): Promise<void> {
    const query = this.firestore.collection(coleccion, ref => ref.where("uid", "==", uidObjeto).limit(1));

    return query.get().toPromise()
      .then((querySnapshot: any) => {
        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;

          const documentRef = this.firestore.collection(coleccion).doc(docId);

          let data = {
            ...querySnapshot.docs[0].data,
            [atributo]: valor
          }

          return documentRef.update(data);
        } else {
          console.log('No se encontró ningún documento con el atributo y valor especificado.');
          return Promise.reject();
        }
      })
      .catch((error) => {
        console.error('Error al modificar el documento:', error);
        return Promise.reject(error);
      });
  }

  obtenerUidUsuarioLogueado(coleccion: string): Promise<string> {
    return this.firestore.collection(coleccion, ref =>
      ref.where("mail", "==", this.emailUsuarioLogueado)
    ).get().toPromise()
      .then(querySnapshot => {
        if (querySnapshot != undefined && !querySnapshot.empty) {
          const documento: any = querySnapshot.docs[0].data();

          const uid = documento.uId;

          return uid;
        } else {
          console.log("No se encontraron documentos con el correo especificado.");
        }
      })
      .catch(error => {
        console.error("Error al obtener el correo del usuario:", error);
      });
  }

  obtenerUsuarioDeBaseDeDatos() {
    const colecciones = ["pacientes", "especialistas", "administradores"];

    // Array de promesas de consultas
    const queryPromises = colecciones.map(coleccion =>
      this.firestore.collection(coleccion, ref =>
        ref.where("mail", "==", this.emailUsuarioLogueado)
      ).get().toPromise()
    );

    // Realizar las consultas en paralelo
    return Promise.all(queryPromises)
      .then(querySnapshots => {
        // Buscar el primer documento encontrado en alguna colección
        for (const querySnapshot of querySnapshots) {
          if (querySnapshot != undefined && !querySnapshot.empty) {
            const documento = querySnapshot.docs[0].data();
            return { documento };
          }
        }

        // Devolver null si no se encuentra en ninguna colección
        return null;
      })
      .catch(error => {
        // Manejar cualquier error que pueda ocurrir durante las consultas
        console.error("Error al realizar las consultas:", error);
        throw error;
      });
  }
  obtenerUsuarioPorUID(uid:string) {
    const colecciones = ["pacientes", "especialistas", "administradores"];

    // Array de promesas de consultas
    const queryPromises = colecciones.map(coleccion =>
      this.firestore.collection(coleccion, ref =>
        ref.where("uid", "==", uid)
      ).get().toPromise()
    );

    // Realizar las consultas en paralelo
    return Promise.all(queryPromises)
      .then(querySnapshots => {
        // Buscar el primer documento encontrado en alguna colección
        for (const querySnapshot of querySnapshots) {
          if (querySnapshot != undefined && !querySnapshot.empty) {
            const documento = querySnapshot.docs[0].data();
            return { documento };
          }
        }

        // Devolver null si no se encuentra en ninguna colección
        return null;
      })
      .catch(error => {
        // Manejar cualquier error que pueda ocurrir durante las consultas
        console.error("Error al realizar las consultas:", error);
        throw error;
      });
  }

  async altaCita(cita: any) {
    const id = uuidv4();
    const documento = this.firestore.doc("citas/" + id);
    cita.uid=id;
    documento.set(cita);
  }


}
