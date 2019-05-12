import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFireDatabase } from 'angularfire2/database';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { Usuarios } from '../../models/Usuarios';
import { Observable } from "rxjs/Observable";
import * as _ from "lodash";

import { map } from "rxjs/operators";
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
  allusers : any = [];
  filtros = {};
  pair = this.chatService.currentChatPairId;
  availableusers: any = [];
  usuario;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFireDatabase,
    private provider: UsuarioProvider,
    private currrentUser: Usuarios,    
    private chatService: ChatService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ChatsPage");
  }

  ngOnInit() {
    var busca : any;  
    var chats: any[] = [];

    this.allusers = this.provider.getAll();
    return this.db.object('/chats').snapshotChanges().map(c => {
      return { key: c.key, ...c.payload.val() };
    }).subscribe(res => {
      Object.keys(res).forEach(key => {
        var msg = new Object({ key, ...res[key] });
        chats.push(msg);        
        this.chats = this.filtrachat(chats);
      });
    });
   
  }

  filtrachat(chatsToFilter) {
    this.filtros["pair"] = val => val == this.pair;
    chatsToFilter = _.filter(chatsToFilter, _.conforms(this.filtros));
    // console.log(chatsToFilter);
    return chatsToFilter;
  }

  goToChat(chatpartner) {
    chatpartner.id = chatpartner.key;
        
    this.chatService.currentChatPairId = this.chatService.createPairId(this.currrentUser,chatpartner);
    this.chatService.currentChatPartner = chatpartner;

    this.navCtrl.push(ChatroomPage);
  } //goToChat
}