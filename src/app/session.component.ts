import { appConfig } from './app-config.generated';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppIconComponent } from './app-icon.component';
import { accountSession, setScope, supabase } from './account';
@Component({selector:'app-session',standalone:true,imports:[FormsModule,AppComponent,AppIconComponent],templateUrl:'./session.component.html'})
export class SessionComponent {
 config=appConfig;
 loading=signal(true);ready=signal(false);mode=signal<'login'|'signup'|'signup-success'|'reset'|'password'>('login');email='';password='';name='';accepted=false;busy=signal(false);message=signal('');notice=signal<{type:'success'|'error'|'info',title:string,text:string}|null>(null);
 page=signal(new URLSearchParams(location.search).get('page')||'');
 constructor(){
  window.addEventListener('study-account-required',(event:any)=>{try{sessionStorage.setItem('study-pending-action',JSON.stringify(event?.detail||{}))}catch{}this.showAccount('signup')});
  supabase.auth.onAuthStateChange((event,session)=>{accountSession.set(session);if(event==='PASSWORD_RECOVERY'){this.mode.set('password');this.ready.set(false);this.loading.set(false);return}if(event==='SIGNED_OUT'){this.ready.set(false);this.loading.set(false)}if(session)setTimeout(()=>{if(this.mode()!=='password'&&this.mode()!=='signup-success')this.enter(session.user.id)},0)});
  void supabase.auth.getSession().then(({data})=>{accountSession.set(data.session);this.loading.set(false);if(data.session&&this.mode()!=='password'&&this.mode()!=='signup-success')this.enter(data.session.user.id)});
  window.addEventListener('study-account-exit',()=>{this.ready.set(false);this.message.set('');this.password='';localStorage.removeItem('study-guest-entered');setScope('guest')});
 }
 enter(id:string){setScope(id);this.loading.set(false);this.ready.set(true);if(id!=='guest')window.setTimeout(()=>window.dispatchEvent(new CustomEvent('study-account-ready')),0)}
 showAccount(mode:'login'|'signup'='signup'){this.ready.set(false);this.mode.set(mode);this.message.set('');this.notice.set(null);this.password=''}
 switchMode(mode:'login'|'signup'|'reset'){this.mode.set(mode);this.message.set('');this.notice.set(null);this.password=''}
 closeNotice(){const wasSignupSuccess=this.mode()==='signup-success';this.notice.set(null);if(wasSignupSuccess)this.switchMode('login')}
 passwordChecks(){const value=this.password;return {length:value.length>=8,upper:/[A-Z]/.test(value),lower:/[a-z]/.test(value),number:/\d/.test(value),special:/[^A-Za-z0-9]/.test(value)}}
 passwordValid(){const checks=this.passwordChecks();return checks.length&&checks.upper&&checks.lower&&checks.number&&checks.special}
 passwordError(){return 'A senha deve ter pelo menos 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.'}
 async submit(){if(this.busy())return;this.message.set('');this.notice.set(null);this.busy.set(true);try{
 const redirect=new URL(location.pathname,location.origin).href;
 if(this.mode()==='signup'){
  if(!this.accepted||!this.name.trim())throw new Error('Informe seu nome e confirme a leitura da privacidade.');
  if(!this.passwordValid())throw new Error(this.passwordError());
  const {data,error}=await supabase.auth.signUp({email:this.email.trim(),password:this.password,options:{data:{display_name:this.name.trim()},emailRedirectTo:redirect}});if(error)throw error;
  this.password='';this.mode.set('signup-success');const text=data.session?'Sua conta foi criada com sucesso. Você já pode continuar para o aplicativo.':'Sua conta foi criada corretamente. Enviamos um e-mail de confirmação para '+this.email.trim()+'. Confirme o e-mail antes de entrar.';this.message.set(text);this.notice.set({type:'success',title:'Conta criada com sucesso!',text});
 }else if(this.mode()==='reset'){
  const {error}=await supabase.auth.resetPasswordForEmail(this.email.trim(),{redirectTo:redirect});if(error)throw error;const text='Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.';this.message.set(text);this.notice.set({type:'info',title:'Verifique seu e-mail',text});
 }else if(this.mode()==='password'){
  if(!this.passwordValid())throw new Error(this.passwordError());const {error}=await supabase.auth.updateUser({password:this.password});if(error)throw error;this.password='';this.enter(accountSession()!.user.id);
 }else{const {error}=await supabase.auth.signInWithPassword({email:this.email.trim(),password:this.password});if(error)throw error;this.password=''}
 }catch(error:any){const text=error?.message==='Invalid login credentials'?'E-mail ou senha incorretos.':error?.message==='Email not confirmed'?'Confirme seu e-mail antes de entrar.':error?.code==='email_address_not_authorized'?'Não foi possível concluir o cadastro com este e-mail. Tente novamente ou use outro endereço.':(error?.code==='over_email_send_rate_limit'||error?.status===429)?'Muitas tentativas de envio de e-mail foram feitas em pouco tempo. Aguarde alguns minutos e tente novamente.':error?.message||'Não foi possível conectar. Tente novamente.';this.message.set(text);this.notice.set({type:'error',title:'Não foi possível concluir',text})}finally{this.busy.set(false)}}
 beginDeletion(){localStorage.setItem('study-open-settings','yes');this.closePage();if(!accountSession()){this.ready.set(false);this.mode.set('login')}}
 closePage(){history.replaceState(null,'',location.pathname);this.page.set('')}
}
