import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from "@ionic/storage";
import { UsuarioProvider } from '../providers/usuario/usuario';
import { Usuarios } from '../models/Usuarios';
import { Observable } from "rxjs/Observable";

import { map } from "rxjs/operators";
import { ChatService } from "../app/app.service";
import { ChatroomPage } from "../pages/chatroom/chatroom";

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
  allusers : any = [];
  availableusers: any = [];
  usuario;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFireDatabase,
    private provider: UsuarioProvider,    
    private chatService: ChatService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ChatsPage");
  }

  ngOnInit() {
    var busca : any;  
    this.allusers = this.provider.getAll();
   
  }

  goToChat(chatpartner) {
    this.chatService.currentChatPairId = this.chatService.createPairId(
      this.usuario,
      chatpartner
    );

    this.chatService.currentChatPartner = chatpartner;

    this.navCtrl.push(ChatroomPage);
  } //goToChat
}
