import { studyTimeZone } from './study-clock';
export function calendarReminder(time:string,days:number[],now=new Date(),timeZone=studyTimeZone()){
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!days.length||days.some(d=>!Number.isInteger(d)||d<0||d>6))throw new Error('Escolha um horário e pelo menos um dia.');
 const names=['SU','MO','TU','WE','TH','FR','SA'];
 const [h,m]=time.split(':');const today=now.toLocaleDateString('en-CA',{timeZone}).replaceAll('-','');
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//App Flash Card//Lembretes//PT-BR','BEGIN:VEVENT',`UID:study-reminder-${crypto.randomUUID()}@app-flash-card`,`DTSTAMP:${now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;TZID=${timeZone}:${today}T${h}${m}00`,'DURATION:PT10M',`RRULE:FREQ=WEEKLY;BYDAY=${[...new Set(days)].sort().map(d=>names[d]).join(',')}`,'SUMMARY:Hora de estudar — App Flash Card','DESCRIPTION:Abra o App Flash Card e faça uma pequena sessão de revisão.','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Hora de revisar seus flashcards','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
