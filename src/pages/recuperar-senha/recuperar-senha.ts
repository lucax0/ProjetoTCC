import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController,LoadingController } from 'ionic-angular';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { Usuarios } from '../../models/Usuarios';
import { FormBuilder, FormGroup, Validators, EmailValidator,  } from '@angular/forms';
import { LoginPage } from '../login/login';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { database } from 'firebase';

/**
 * Generated class for the RecuperarSenhaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-recuperar-senha',
  templateUrl: 'recuperar-senha.html',
})
export class RecuperarSenhaPage {
  private form: FormGroup;
  private usuario: any;

  constructor(public navCtrl: NavController,private emailComposer: EmailComposer,private currentUser: Usuarios,private formBuilder: FormBuilder, public navParams: NavParams, private toast: ToastController,private loadingCtrl: LoadingController,private provider: UsuarioProvider) {
    this.usuario = this.navParams.data.contact || {};
    this.createForm();

  }

  createForm() {
    this.form = this.formBuilder.group({
      key: [this.usuario.id],
      id: [this.usuario.id, Validators.required],
      cpf: [this.usuario.cpf, Validators.required],
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad RecuperarSenhaPage');
  }
  
  RecuperarSenhaRandom() {
    const loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Carregando...'
    });
    loading.present();
    
    if (this.form.controls.id.value == null) {
      loading.dismiss();
      this.toast.create({ message: 'O campo de id deve ser preenchido!', duration: 3000 }).present();
      
      return;
    }
    if (this.form.controls.cpf.value == null) {
      loading.dismiss();
      this.toast.create({ message: 'O campo de cpf deve ser preenchido!', duration: 3000 }).present();
      
      return;
    }
    /*
    var user: any;
    user = this.provider.get(this.form.controls.id.value);
    if(user != undefined){
      this.toast.create({ message: 'id inexistente!', duration: 30000 }).present();
    }
    */

      let outString: string = '';
      let inOptions: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
      for (let i = 0; i < 20; i++) {
  
        outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
        
      }
      
     this.provider.get(this.form.controls.id.value).subscribe(async (data) => {
      loading.present();
      this.usuario = data;
      this.usuario.id = data.key;
     
     console.log(this.usuario)

     if(this.usuario.cpf != this.form.controls.cpf.value){
      this.toast.create({ message: 'Um ou mais campos errados!', duration: 4000 }).present();
      loading.dismiss();
      this.navCtrl.push(LoginPage)
     }else{
      this.provider.updateSenha(outString,this.form.controls.id.value);
      /*
      this.emailComposer.isAvailable().then((available: boolean) =>{
        if(available) {
          //Now we know we can send
          
        }
       });
       
       let email = {
        to: this.usuario.email,
        subject: 'Recuperação de senha - EqualClass',
        body: 'Olá, uma recuperação de senha foi solicitada para a sua conta, aqui está uma nova senha que poderá ser ultilizada:' + outString,
        isHtml: true
      }
      this.emailComposer.open(email);
      */
      this.toast.create({ message: 'Senha nova enviada com sucesso!', duration: 4000 }).present();
      loading.dismiss();
      this.navCtrl.push(LoginPage)
     }
    });
    }
  /*
  enviaEmail(email,senha){
    let email = {
      *   to: email.value,
      *   subject: 'Recuperação de senha - EqualClass',
      *   body: 'Olá, uma recuperação de senha foi solicitada para a sua conta, aqui está uma nova senha que poderá ser ultilizada:' + senha,
      *   isHtml: true
      * }
  }
    */


  
}
