import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';

/*
  Generated class for the AulaProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AulaProvider {
  private PATH = '/solicitacoes/';

  constructor(private db: AngularFireDatabase, private localNotifications: LocalNotifications) { }

  get(key: string) {
    return this.db.object(this.PATH + key).snapshotChanges().map(c => {
      return { key: c.key, ...c.payload.val() };
    });
  }

  saveSolicitacoes(aula: any, solicitante: string, tutor: string, key: string) {
    return new Promise((resolve, reject) => {
      this.db.list(this.PATH + '/solicitado/' + tutor)
        .update(solicitante + key, {
          tutor: tutor,
          solicitante: solicitante,
          hora: aula.hora,
          dataA: aula.dataA,
          materia: aula.materia,
          desc: aula.desc,
          visto: false,
          estado: 'Pendente'
        })
        .then(() => {
          this.db.list(this.PATH + '/solicitante/' + solicitante)
            .update(tutor + key, {
              tutor: tutor,
              solicitante: solicitante,
              hora: aula.hora,
              dataA: aula.dataA,
              materia: aula.materia,
              desc: aula.desc,
              visto: false,
              estado: 'Pendente'
            }).then(() => resolve())
            .catch((e) => reject(e));
        })
        .catch((e) => reject(e));
    })
  }

  remove(key: string) {
    return this.db.list(this.PATH).remove(key);
  }

  mudarEstadoAula(aula: any, nvEstado: string) {
    return new Promise((resolve, reject) => {
      this.db.list(this.PATH + '/solicitado/' + aula.tutor)
        .update(aula.solicitante + String(aula.dataA).replace("-", "").replace("-", "") + String(aula.hora).replace(":", ""), {
          estado: nvEstado,
        })
        .then(() => {
          this.db.list(this.PATH + '/solicitante/' + aula.solicitante)
            .update(aula.tutor + String(aula.dataA).replace("-", "").replace("-", "") + String(aula.hora).replace(":", ""), {
              estado: nvEstado,
            })
            .then(() => resolve())
            .catch((e) => { return reject(e) });
        })
        .catch((e) => { return reject(e) });
    })
  }

  alterarTolken(tolken: number, user: string, op: boolean) {
    if (op) {
      tolken = tolken + 3;
    }
    else {
      if (tolken < 3) {
        return new Promise((reject) => { return reject() });
      }
      tolken = tolken - 3;
    }

    return new Promise((resolve, reject) => {
      this.db.list('/usuarios/')
        .update(user, {
          tolkens: tolken,
        })
        .then(() => resolve())
        .catch((e) => { return reject(e); });
    })
  }

  alterarVisualizado(aula: any, op: boolean) {
    return new Promise((resolve, reject) => {
      this.db.list(this.PATH + '/solicitante/' + aula.solicitante)
        .update(aula.tutor + String(aula.dataA).replace("-", "").replace("-", "") + String(aula.hora).replace(":", ""), {
          visto: op,
        }).then(() => {
   
          /*this.db.list(this.PATH + '/solicitado/' + aula.tutor)
            .update(aula.solicitante + String(aula.dataA).replace("-", "").replace("-", "") + String(aula.hora).replace(":", ""), {
              visto: op,
            })
            .then(() => */ resolve() /*)
            .catch((e) => { return reject(e) });*/
        })
        .catch((e) => { return reject(e) });
    })
  }

  marcarAula(aula: any, key: string) {
    return new Promise((resolve, reject) => {
      this.db.list('/aulas-marcadas/' + aula.tutor)
        .update(key, {
          tutor: aula.tutor,
          solicitante: aula.solicitante,
          hora: aula.hora,
          dataA: aula.dataA,
          materia: aula.materia,
          desc: aula.desc,
          nota: 0,
          estado: 'Pendente'
        })
        .then(() => resolve())
        .catch((e) => reject(e));
    })
  }

  getAula(key: string, tutor: string) {
    return this.db.object('/aulas-marcadas/' + tutor + '/' + key).snapshotChanges().map(c => {
      return { key: c.key, ...c.payload.val() };
    });
  }
}
