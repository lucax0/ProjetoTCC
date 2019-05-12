import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import * as _ from "lodash";
import { AulaProvider } from '../../providers/aula/aula';
import { Usuarios } from '../../models/Usuarios';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { Calendar } from '@ionic-native/calendar';
import { LocalNotifications } from '@ionic-native/local-notifications';

/**
 * Generated class for the AulasPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-aulas',
  templateUrl: 'aulas.html',
})
export class AulasPage {
  private estado: string;
  private aulasFiltradas: any;
  private refresh: boolean = false;
  private aulasPropostas: any = "";
  private aulasSolicitadas: any = "";
  private myClasses: boolean = undefined;

  filtros = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, private provider: AulaProvider,
    private currentUser: Usuarios, private alert: AlertController, private userC: UsuarioProvider,
    private calendar: Calendar, private localNotifications: LocalNotifications, private toast: ToastController) {

    var key: string;
    var aulas: Array<any> = new Array;
    var idNot: number = 0;

    this.provider.get('/solicitado/' + this.currentUser.id + '/').subscribe(async (data) => {
      idNot = 0;
      aulas = new Array;
      this.aulasPropostas = aulas;

      Object.keys(data).forEach(key => {
        var aula: any;
        aula = new Object({ key, ...data[key] });
        if (aula.estado == 'Pendente') {
          this.checkExpired(aula);
          this.notificarPendente(aula, idNot);
          idNot = idNot + 1;
        }
        aulas.push(aula);
      });
      this.aulasPropostas = aulas.slice(1);
      if (this.refresh) {
        this.getSolicitacoes(this.estado);
      } else {
        this.refresh = true;
      }
    });


    var  res: Array<any> = new Array;

    this.provider.get('/solicitante/' + this.currentUser.id + '/').subscribe(async (data) => {
      aulas = new Array;
      res = new Array;
      this.aulasSolicitadas = aulas;

      Object.keys(data).forEach(async key => {
        var aula: any;
        aula = new Object({ key, ...data[key] });
        aulas.push(aula);
        if (aula.visto == false && aula.estado != "Pendente") {
          res.push(aula);      
        }
      });
      this.aulasSolicitadas = aulas.slice(1);
      if (this.refresh) {
        this.getSolicitacoes(this.estado);
      } else {
        this.refresh = true;
      }
      await this.notificarResposta( res,idNot);
    });
  }

  ionViewDidLoad() {
  }

  showBar(barra: string) {
    if (barra == "Solicitacao") {
      this.myClasses = true;
      this.getSolicitacoes(this.estado);
    }
    else {
      this.myClasses = false;
      this.getSolicitacoes(this.estado);
    }
  }

  getSolicitacoes(estado: any) {
    this.filtros['estado'] = val => val == estado;
    if (this.myClasses) {
      this.aulasFiltradas = _.filter(this.aulasPropostas, _.conforms(this.filtros));
    }
    else {
      this.aulasFiltradas = _.filter(this.aulasSolicitadas, _.conforms(this.filtros));
    }
    this.estado = estado;
  }

  setAnswer(aula: any) {
    if (aula.estado != "Pendente") { return; }

    var confirm;

    if (this.myClasses) {
      confirm = this.alert.create({
        title: 'Confirmação de Solicitação',
        message: 'O que você deseja fazer em relação a esta solicitação?',
        buttons: [
          { text: 'Aceitar', handler: () => { this.aceitarAula(aula); } },
          { text: 'Recusar', handler: () => { this.recusarAula(aula); } },
          { text: 'Responder mais tarde', handler: () => { return; } }
        ]
      });
    } else {
      confirm = this.alert.create({
        title: 'Cancelamento de solicitação',
        message: 'Você deseja cancelar esta solicitação?',
        buttons: [
          { text: 'Sim', handler: () => { this.recusarAula(aula); } },
          { text: 'Não', handler: () => { return; } }
        ]
      });
    }

    confirm.present();
  }

  recusarAula(aula: any) {
    var promiseUser = this.userC.get(aula.solicitante).subscribe(async (data) => {
      var user: any;
      user = data;
      promiseUser.unsubscribe();
      this.provider.mudarEstadoAula(aula, "Recusada")
        .then(async (done) => {
          this.provider.alterarTolken(user.tolkens, aula.solicitante, true)
            .then(async (reallyDone) => {
              this.getSolicitacoes('Pendente');
            })
        })
    });
  }

  aceitarAula(aula: any) {
    var promiseUser = this.userC.get(aula.solicitante).subscribe(async (data) => {
      var user: any;
      user = data;
      promiseUser.unsubscribe();
      var pieces = String(aula.dataA).split("-");
      var key: string = pieces[0] + pieces[1] + pieces[2] + String(aula.hora).replace(":", "");

      this.provider.getAula(key, aula.tutor).subscribe(async (data) => {
        if (data.key == null) {
          this.provider.marcarAula(aula, key).then(() => {
            this.provider.mudarEstadoAula(aula, "Confirmada")
              .then(() => {
                this.calendar.createEvent("Aula de " + aula.materia, "", "Auxiliar com as respectivas dificuldades da matéria.\n" + aula.desc, aula.dataA, aula.dataA).then(() => {
                  this.getSolicitacoes('Pendente');
                });
              })
          }).catch((e) => {
            this.toast.create({ message: 'Houve um erro ao marcar a aula!', duration: 3000 }).present();
          });
        } else {
          this.toast.create({ message: 'Já há uma aula marcada para esta data!', duration: 3000 }).present();
        }
      });
    });
  }

  public notificarPendente(aula: any, num: number) {
    this.localNotifications.schedule({
      id: Number(num),
      text: 'Solicitação de aula de ' + aula.materia,
      //sound: isAndroid? 'file://sound.mp3': 'file://beep.caf',
      data: { secret: "Dia:" + aula.dataA + "\nHora:" + aula.hora }
    });
  }

  public notificarResposta(res: Array<any>, num: number) {
    res.forEach((aula)=>{
      num = num + 1
      this.localNotifications.schedule({
        id: Number(num),
        text: 'Solicitação de aula de ' + aula.materia,
        //sound: isAndroid? 'file://sound.mp3': 'file://beep.caf',
        data: { secret: "Dia:" + aula.dataA + "\nHora:" + aula.hora }
      });

      this.provider.alterarVisualizado(aula, true);
    }); 
  }

  public checkExpired(aula: any) {
    var date = new Date;
    var data = String(aula.dataA).split("-");
    var hora = String(aula.hora).split(":");

    var dataAula = new Date(Number(data[0]), Number(data[1]) - 1, Number(data[2]), Number(hora[0]), Number(hora[1]));
    var now = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), (date.getUTCHours() - 3), date.getUTCMinutes());

    if (dataAula.valueOf() <= now.valueOf()) {
      this.recusarAula(aula);
    }
  }

}