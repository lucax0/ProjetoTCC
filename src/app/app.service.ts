import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { Chat } from "../models/Chat";
import { Usuarios} from "../models/Usuarios";
import { UsuarioProvider } from "../providers/usuario/usuario";
import { appconfig } from "../pages/chatroom/Chatconfig";

@Injectable()
export class ChatService { //service do chat 

  users: AngularFirestoreCollection<Usuarios>;  
  private provider: UsuarioProvider;
  chats: AngularFirestoreCollection<Chat>;
 

  //pair indica os dois users que esntao na call
  currentChatPairId;
  currentChatPartner;

  constructor(private db: AngularFirestore) {
    //Get the tasks collecction
    this.users = db.collection<Usuarios>(appconfig.users_endpoint);
    this.chats = db.collection<Chat>(appconfig.chats_endpoint);
  }

  addChat(chat: Chat) {
    return this.chats.add(chat);
  } //addChat

  createPairId(user1, user2) {
    let pairId;
    if (user1.time < user2.time) {
      pairId = `${user1.email}|${user2.email}`;
    } else {
      pairId = `${user2.email}|${user1.email}`;
    }

    return pairId;
  } //createPairString  
}