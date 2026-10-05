import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { SessionComponent } from './app/session.component';
import { I18nService } from './app/i18n.service';

async function clearLegacyServiceWorkerCaches(){
  if(!('serviceWorker' in navigator))return;
  try{
    const registrations=await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration=>registration.unregister()));
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(key=>key.startsWith('ngsw:')).map(key=>caches.delete(key)));
    }
  }catch{}
}

function mountLanguageSwitcher(i18n:I18nService){
  const button=document.createElement('button');
  button.type='button';
  button.className='language-switcher';
  Object.assign(button.style,{
    position:'fixed',top:'16px',right:'16px',zIndex:'300',minWidth:'48px',height:'40px',padding:'0 12px',
    border:'1px solid #e9ecf3',borderRadius:'999px',background:'#fff',color:'#4823bb',fontWeight:'700',
    fontSize:'12px',boxShadow:'0 6px 24px rgba(31,40,71,.08)'
  });
  const render=()=>{
    const isPt=i18n.language()==='pt-BR';
    button.textContent=isPt?'EN':'PT';
    button.setAttribute('aria-label',isPt?'Switch language to English':'Mudar idioma para português');
    button.setAttribute('title',isPt?'English':'Português');
  };
  button.addEventListener('click',()=>{i18n.toggle();render()});
  render();
  document.body.appendChild(button);
}

void clearLegacyServiceWorkerCaches().finally(()=>{
  bootstrapApplication(SessionComponent,{providers:[provideServiceWorker('ngsw-worker.js',{enabled:false})]})
    .then(ref=>{
      const i18n=ref.injector.get(I18nService);
      i18n.start();
      mountLanguageSwitcher(i18n);
    })
    .catch(err=>console.error(err));
});
