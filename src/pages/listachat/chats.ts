import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, NavParams, LoadingController } from "ionic-angular";
import { AngularFireDatabase } from 'angularfire2/database';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { Usuarios } from '../../models/Usuarios';
import * as _ from "lodash";

import { ChatService } from "../../app/app.service";

/**
 * Generated class for the ChatsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-chats",
  templateUrl: "chats.html"
})
export class ChatsPage implements OnInit {

  chats: any[] = [];
  filtros = {};
  pair = this.chatService.currentChatPairId;
  availableusers: any[] = [];
  usuario;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFireDatabase,
    private provider: UsuarioProvider,
    private currrentUser: Usuarios,
    private chatService: ChatService,
    private loadingCtrl: LoadingController
  ) { }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ChatsPage");
  }

  ngOnInit() {
    var chats: any[] = [];

    return this.db.object('/chats').snapshotChanges().map(c => {
      return { key: c.key, ...c.payload.val() };

    }).subscribe(res => {

      Object.keys(res).forEach(key => {
        var msg = new Object({ key, ...res[key] });
        chats.push(msg);
      });
      chats = chats.slice(1);
      this.pegarUsuariosConectados(chats);
    });

  }

  pegarUsuariosConectados(list) {
    const loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Carregando...'
    });

    loading.present();
    for (let obj of list) {
      var users = obj.pair.split("|", 2);
      var user1 = users[0];
      var user2 = users[1];
      if (user1 == this.currrentUser.id) {
        this.addUsuarioLista(user2);
      } else if (user2 == this.currrentUser.id) {
        this.addUsuarioLista(user1);
      }
    }
    loading.dismiss();
  }

  addUsuarioLista(id) {
    this.provider.get(id).subscribe(async (data) => {
      var user: any;
      user = data;
      user.id = data.key;
      if (user.id != this.currrentUser.id && !this.verifyUser(user, this.availableusers)) {
        this.availableusers.push(user);
      }
    });
  }

  verifyUser(user, list) {
    var user = user.id;
    for (let obj of list) {
      if (user === obj.id) {
        return true;
      }
    }
    return false;
  }

  goToChat(chatpartner) {

    this.chatService.currentChatPairId = this.chatService.createPairId(this.currrentUser, chatpartner);
    this.chatService.currentChatPartner = chatpartner;

    this.navCtrl.push("ChatroomPage");
  } //goToChat
}
