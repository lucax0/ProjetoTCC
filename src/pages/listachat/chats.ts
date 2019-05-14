import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFireDatabase } from 'angularfire2/database';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { Usuarios } from '../../models/Usuarios';
import { Observable } from "rxjs/Observable";
import * as _ from "lodash";

import { map } from "rxjs/operators";
import { Chat } from "../../models/Chat"
import { ChatService } from "../../app/app.service";
import { ChatroomPage } from "../chatroom/chatroom";

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
    private chatService: ChatService
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
        console.log(msg);
        chats.push(msg);
      });
      chats = chats.slice(1);
      this.pegarUsuariosConectados(chats);
    });

  }

  pegarUsuariosConectados(list) { 
    for (let obj of list) {
      var users = obj.pair.split("|", 2);
      var user1 = users[0];
      var user2 = users[1];
      if (user1 == this.currrentUser.id) {
        this.addUsuarioLista(user2);
      } else if(user2 == this.currrentUser.id){        
        this.addUsuarioLista(user1);     
      }
    }
  }

    addUsuarioLista(id){
      var allusers: any[] = [];
      allusers = this.provider.getAll();
      console.log(this.provider.get(id));
      debugger;
      if(!this.availableusers.some(x => x === id)){
        this.availableusers.push(this.filtrausers(allusers,id));  
      }          
    }      
      
    filtrausers(chatsToFilter , id) {
      var usuario;
      this.filtros["id"] = val => val == id;
      debugger;
      usuario = _.filter(chatsToFilter, _.conforms(this.filtros));
      return usuario.id;
    }

  goToChat(chatpartner) {
    chatpartner.id = chatpartner.key;

    this.chatService.currentChatPairId = this.chatService.createPairId(this.currrentUser, chatpartner);
    this.chatService.currentChatPartner = chatpartner;

    this.navCtrl.push(ChatroomPage);
  } //goToChat
}
