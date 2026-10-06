import { appConfig } from './app-config.generated';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { accountSession, accountScope, clearAccountCache, supabase } from './account';
import { cache, cached, flush, hasPending, write } from './sync';
import { calendarReminder } from './reminders';
@Component({selector:'app-account-panel',standalone:true,imports:[FormsModule],templateUrl:'./account-panel.component.html'})
export class AccountPanelComponent {
 config=appConfig;
 session=accountSession; name=cached('display-name',accountSession()?.user.user_metadata?.['display_name']||'');time=cached('reminder-time','20:00');days=signal<number[]>(cached('reminder-days',[0,1,2,3,4,5,6]));week=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];message=signal('');busy=signal(false);support='';deleteOpen=signal(false);confirmation='';password='';notifications=signal(cached('browser-reminders',false));
 saveName(){cache('display-name',this.name.trim());write('account_preferences',{display_name:this.name.trim()});this.message.set('Nome salvo.');window.dispatchEvent(new Event('study-profile-changed'))}
 toggleDay(day:number){this.days.update(v=>v.includes(day)?v.filter(x=>x!==day):[...v,day]);this.saveReminder()}
 saveReminder(){cache('reminder-time',this.time);cache('reminder-days',this.days());write('account_preferences',{reminder_time:this.time,reminder_days:this.days()})}
 exportCalendar(){try{this.saveReminder();const text=calendarReminder(this.time,this.days());const url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='minha-rotina-de-estudos.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.message.set('Importe o arquivo no seu calendário para receber lembretes mesmo com o aplicativo fechado.')}catch(error:any){this.message.set(error.message)}}
 async enableNotifications(){if(!('Notification' in window)){this.message.set('Este navegador não oferece notificações. Use a agenda do calendário.');return}const permission=await Notification.requestPermission();const enabled=permission==='granted';cache('browser-reminders',enabled);this.notifications.set(enabled);window.dispatchEvent(new Event('study-reminders-changed'));this.message.set(enabled?'Lembretes ativados enquanto o aplicativo estiver aberto.':'Permissão não concedida. Você pode usar o calendário.')}
 disableNotifications(){cache('browser-reminders',false);this.notifications.set(false);window.dispatchEvent(new Event('study-reminders-changed'))}
 async logout(){await flush();if(hasPending()){this.message.set('Há alterações salvas neste dispositivo aguardando envio. Conecte-se e tente sair novamente.');return}const {error}=await supabase.auth.signOut({scope:'local'});if(error){this.message.set('Não foi possível sair. Tente novamente.');return}window.dispatchEvent(new Event('study-account-exit'))}
 exitGuest(){window.dispatchEvent(new Event('study-account-exit'))}
 async sendSupport(){if(this.support.trim().length<10){this.message.set('Descreva sua solicitação com pelo menos 10 caracteres.');return}this.busy.set(true);try{const {error}=await supabase.from('support_requests').insert({user_id:accountScope(),message:this.support.trim()});if(error)throw error;this.support='';this.message.set('Solicitação registrada para a responsável.')}catch{this.message.set('Não foi possível enviar. Verifique a conexão.')}finally{this.busy.set(false)}}
 async deleteAccount(){if(this.confirmation!=='EXCLUIR'||!this.password||!this.session())return;this.busy.set(true);this.message.set('');try{
 const {error:reauth}=await supabase.auth.signInWithPassword({email:this.session()!.user.email!,password:this.password});if(reauth)throw reauth;this.password='';
 const {data,error}=await supabase.functions.invoke('delete-account',{body:{confirmation:'EXCLUIR'}});if(error||!data?.deleted)throw error||new Error();clearAccountCache();await supabase.auth.signOut({scope:'local'});accountSession.set(null);window.dispatchEvent(new Event('study-account-exit'));
 }catch{this.password='';this.message.set('Não foi possível excluir. Confira sua senha e conexão. Seus dados foram preservados se a exclusão não foi confirmada.')}finally{this.busy.set(false)}}
}
