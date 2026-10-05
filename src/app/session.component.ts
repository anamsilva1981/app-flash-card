import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppIconComponent } from './app-icon.component';
import { accountSession, setScope, supabase } from './account';
@Component({selector:'app-session',standalone:true,imports:[FormsModule,AppComponent,AppIconComponent],templateUrl:'./session.component.html'})
export class SessionComponent {
 loading=signal(true);ready=signal(false);mode=signal<'login'|'signup'|'signup-success'|'reset'|'password'>('login');email='';password='';name='';accepted=false;busy=signal(false);message=signal('');
 page=signal(new URLSearchParams(location.search).get('page')||'');
 constructor(){
  window.addEventListener('study-account-required',(event:any)=>{try{sessionStorage.setItem('study-pending-action',JSON.stringify(event?.detail||{}))}catch{}this.showAccount('signup')});
  supabase.auth.onAuthStateChange((event,session)=>{accountSession.set(session);if(event==='PASSWORD_RECOVERY'){this.mode.set('password');this.ready.set(false);this.loading.set(false);return}if(event==='SIGNED_OUT'){this.ready.set(false);this.loading.set(false)}if(session)setTimeout(()=>{if(this.mode()!=='password'&&this.mode()!=='signup-success')this.enter(session.user.id)},0)});
  void supabase.auth.getSession().then(({data})=>{accountSession.set(data.session);this.loading.set(false);if(data.session&&this.mode()!=='password'&&this.mode()!=='signup-success')this.enter(data.session.user.id);else this.guest()});
  window.addEventListener('study-account-exit',()=>{this.ready.set(false);this.message.set('');this.password='';localStorage.removeItem('study-guest-entered');setScope('guest')});
 }
 enter(id:string){setScope(id);this.loading.set(false);this.ready.set(true);if(id!=='guest')window.setTimeout(()=>window.dispatchEvent(new CustomEvent('study-account-ready')),0)}
 guest(){accountSession.set(null);localStorage.setItem('study-guest-entered','yes');this.enter('guest')}
 showAccount(mode:'login'|'signup'='signup'){this.ready.set(false);this.mode.set(mode);this.message.set('');this.password=''}
 switchMode(mode:'login'|'signup'|'reset'){this.mode.set(mode);this.message.set('');this.password=''}
 async submit(){if(this.busy())return;this.message.set('');this.busy.set(true);try{
 const redirect=new URL(location.pathname,location.origin).href;
 if(this.mode()==='signup'){
  if(!this.accepted||!this.name.trim()||this.password.length<8)throw new Error('Informe seu nome, uma senha de pelo menos 8 caracteres e confirme a leitura da privacidade.');
  const {data,error}=await supabase.auth.signUp({email:this.email.trim(),password:this.password,options:{data:{display_name:this.name.trim()},emailRedirectTo:redirect}});if(error)throw error;
  this.password='';this.mode.set('signup-success');this.message.set(data.session?'Sua conta foi criada com sucesso. Você já pode continuar para o aplicativo.':'Sua conta foi criada com sucesso. Enviamos um e-mail de confirmação para '+this.email.trim()+'. Confirme o e-mail antes de entrar.');
 }else if(this.mode()==='reset'){
  const {error}=await supabase.auth.resetPasswordForEmail(this.email.trim(),{redirectTo:redirect});if(error)throw error;this.message.set('Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.');
 }else if(this.mode()==='password'){
  if(this.password.length<8)throw new Error('Use uma senha de pelo menos 8 caracteres.');const {error}=await supabase.auth.updateUser({password:this.password});if(error)throw error;this.password='';this.enter(accountSession()!.user.id);
 }else{const {error}=await supabase.auth.signInWithPassword({email:this.email.trim(),password:this.password});if(error)throw error;this.password=''}
 }catch(error:any){this.message.set(error?.message==='Invalid login credentials'?'E-mail ou senha incorretos.':error?.message==='Email not confirmed'?'Confirme seu e-mail antes de entrar.':error?.code==='email_address_not_authorized'?'O cadastro por e-mail ainda está em preparação. Você pode continuar sem conta.':error?.status===429?'Aguarde um pouco antes de tentar novamente.':error?.message||'Não foi possível conectar. Tente novamente.')}finally{this.busy.set(false)}}
 beginDeletion(){localStorage.setItem('study-open-settings','yes');this.closePage();if(!accountSession()){this.ready.set(false);this.mode.set('login')}}
 closePage(){history.replaceState(null,'',location.pathname);this.page.set('')}
}
