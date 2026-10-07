const projectRef='elzkhndhkkkfxvtbhilt';

function jwt(){
  const enc=value=>btoa(JSON.stringify(value)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return enc({alg:'HS256',typ:'JWT'})+'.'+enc({sub:'e2e-user',email:'e2e@app.local',role:'authenticated',exp:4102444800})+'.e2e';
}

Cypress.Commands.add('mockBackend',(options={})=>{
  const access_token=jwt();
  const user={id:'e2e-user',aud:'authenticated',role:'authenticated',email:'e2e@app.local',user_metadata:{display_name:'Teste E2E'},app_metadata:{provider:'email',providers:['email']}};
  cy.intercept('POST','**/auth/v1/token?grant_type=password',{statusCode:200,body:{access_token,token_type:'bearer',expires_in:3600,refresh_token:'e2e-refresh',user}}).as('login');
  cy.intercept('GET','**/auth/v1/user',{statusCode:200,body:user});
  cy.intercept('GET','**/rest/v1/account_studies*',{statusCode:200,body:{data:{
    subjects:[
      {id:'angular',name:'Angular',days:[0,1,2,3,4,5,6],archived:false,deck_key:'Angular',routine_initialized:true},
      {id:'javascript',name:'JavaScript',days:[0,1,2,3,4,5,6],archived:false,deck_key:'JavaScript',routine_initialized:true}
    ],
    queue:options.queue??[
      {id:'topic-1',title:'Signals',subject:'Angular',notes:'Revisar signals e computed.',link:null,priority:'alta',status:'todo',completed_at:null,created_at:'2026-10-05T12:00:00Z'},
      {id:'topic-2',title:'Promises',subject:'JavaScript',notes:'Async JavaScript.',link:null,priority:'media',status:'done',completed_at:'2026-10-04T12:00:00Z',created_at:'2026-10-03T12:00:00Z'}
    ],
    activity:[{id:'a1',activity_date:'2026-10-05',kind:'learning',subject:'Angular',topic:'Signals'}],
    progress:[],
    cards:options.cards??[],
    preferences:{display_name:'Teste E2E',reminder_time:'20:00',reminder_days:[1,3,5]}
  }}});
  cy.intercept('POST','**/rest/v1/rpc/apply_account_operation',{statusCode:200,body:{}});
  cy.intercept('POST','**/rest/v1/rpc/complete_study_topic',{statusCode:200,body:{completed_at:'2026-10-05T12:00:00Z'}});
  cy.intercept('POST','**/rest/v1/support_requests*',{statusCode:201,body:{}});
});

Cypress.Commands.add('loginApp',(options={})=>{
  cy.mockBackend(options);
  cy.visit('/');
  cy.contains('Bem-vinda de volta').should('be.visible');
  cy.get('input[name="email"]').type('e2e@app.local');
  cy.get('input[name="password"]').type('Senha@123');
  cy.contains('button','Entrar').click();
  cy.wait('@login');
  cy.contains('Olá, Teste E2E!').should('be.visible');
});
