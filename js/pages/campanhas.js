'use strict';
let workspaceCampaigns=[], workspaceAdmin=false, currentReview=null;
const historyLabels={draft:'Rascunho salvo',submit:'Enviado para análise',check:'Verificação registrada',approve:'Aprovado',changes:'Ajustes solicitados',reject:'Reprovado',pause:'Pausado',close:'Encerrado',resume:'Reativado'};
async function loadWorkspace(){
  workspaceCampaigns=await fundApi('GET',workspaceAdmin?'/api/campaigns/manage':'/api/campaigns/mine');renderWorkspace();
}
function renderWorkspace(){
  const filter=document.getElementById('workflow-filter').value;
  const list=workspaceCampaigns.filter(c=>!filter||(filter==='corrections'?c.status==='changes'||c.status==='review'&&c.approved:filter==='active'?c.approved&&c.liveState==='active':c.status===filter)).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
  document.getElementById('workspace-list').innerHTML=list.length?list.map(c=>{
    const last=[...c.history].reverse().find(h=>['changes','reject','pause','close'].includes(h.action));
    const editable=c.status!=='review'&&!(c.approved&&c.liveState==='closed');
    return '<article class="workspace-card"><div class="workspace-meta">'+fundBadge(c.status)+'<span>#'+c.id+' · '+fundEscape(c.draft.kind==='ongoing'?'Apoio contínuo':'Campanha')+' · '+fundDate(c.updatedAt)+'</span></div><h2>'+fundEscape(c.draft.title||'Campanha sem título')+'</h2><p>'+fundEscape(c.draft.beneficiaryName||'Beneficiário não informado')+'</p><div class="next-step">'+fundEscape(workspaceAdmin ? ({review:'Confira as evidências, registre verificações e decida.',changes:'Aguarde as correções do responsável.',draft:'Rascunho ainda não enviado pelo responsável.',active:'Acompanhe a publicação e analise novas atualizações.',rejected:'Solicitação reprovada. Consulte a justificativa.',paused:'Confira as pendências antes de reativar.',closed:'Consulte o histórico e a prestação de contas.'}[c.status]) : CAMPAIGN_STEPS[c.status])+'</div>'+(last&&['changes','rejected','paused','closed'].includes(c.status)?'<p><strong>Justificativa:</strong> '+fundEscape(last.reason)+'</p>':'')+(c.approved?'<p class="live-notice">Versão pública: '+fundEscape(CAMPAIGN_STATES[c.liveState])+'. Edições pendentes não alteram o Pix aprovado.</p>':'')+'<div class="workspace-actions"><button type="button" class="btn btn-primary" data-review="'+c.id+'">'+(workspaceAdmin?'Analisar e gerenciar':'Histórico e detalhes')+'</button>'+(editable?'<a class="btn btn-outline" href="solicitar-campanha.html?id='+c.id+'">'+(c.approved?'Propor atualização':'Continuar solicitação')+'</a>':'')+(c.publicVersion?'<a class="btn btn-ghost" href="doacoes.html?campanha='+c.id+'">Ver publicação</a>':'')+'</div></article>';
  }).join(''):'<div class="campaign-empty"><h2>Nenhuma campanha nesta situação</h2><p>Uma solicitação pode ajudar um pet, vários animais ou o trabalho de uma organização.</p><a class="btn btn-outline" href="solicitar-campanha.html">Solicitar campanha</a></div>';
}
async function openReview(id){
  currentReview=await fundApi('GET','/api/campaigns/'+Number(id));renderReview();
  const dialog=document.getElementById('campaign-review');if(!dialog.open)dialog.showModal();
}
function renderReview(){
  const c=currentReview,d=c.draft;
  document.getElementById('review-error').hidden=true;
  document.getElementById('review-title').textContent=d.title||'Solicitação #'+c.id;
  const comparison=c.approved?'<div class="review-comparison"><div><h3>Versão pública aprovada</h3>'+campaignPreview(c.approved)+'<p><strong>Pix aprovado:</strong> '+fundEscape(c.approved.pixKey)+'</p></div><div><h3>Versão proposta</h3>'+campaignPreview(d)+'<p><strong>Pix proposto:</strong> '+fundEscape(d.pixKey)+'</p></div></div>':campaignPreview(d)+'<p><strong>Chave proposta:</strong> '+fundEscape(d.pixKey)+'</p>';
  document.getElementById('review-content').innerHTML=fundBadge(c.status)+comparison+
    (d.closeRequested?'<p class="next-step">O responsável solicita encerramento. Aprovar esta versão encerrará o recebimento.</p>':'')+'<h3>Recebedor</h3><p>'+fundEscape(d.receiverRelation)+' · '+fundEscape(d.receiverReason||'')+'</p><p>Autorização declarada pelo solicitante: '+(d.receiverAuthorization?'sim':'não se aplica / não informada')+'. A declaração não comprova titularidade.</p>'+
    '<h3>Evidências privadas</h3><ul class="file-list">'+c.files.map(f=>'<li><a href="/api/campaign-files/'+f.id+'" download>'+fundEscape(f.name)+'</a><span>'+Math.ceil(f.size/1024)+' KB</span></li>').join('')+'</ul>'+
    (d.updateText||d.expenseDescription||d.progressNote?'<h3>Atualização e apuração propostas</h3><p class="preserve-lines">'+fundEscape([d.updateText,d.expenseDescription,d.progressNote].filter(Boolean).join('\n'))+'</p><p>Total proposto: '+fundMoney(d.raisedCents)+'</p>':'')+
    '<h3>Histórico</h3><ul class="history-list">'+c.history.map(h=>'<li><strong>'+fundEscape(historyLabels[h.action]||h.action)+'</strong> · '+fundEscape(h.actorName)+'<time>'+fundDate(h.at)+'</time><p>'+fundEscape(h.reason)+'</p></li>').join('')+'</ul>'+
    (workspaceAdmin?'<h3>Verificações privadas da equipe</h3><ul class="history-list">'+(c.checks||[]).map(v=>'<li><strong>'+fundEscape(v.actorName)+'</strong> · '+fundDate(v.at)+'<p class="preserve-lines">'+fundEscape(v.note)+'</p>'+(v.external?'<p>Fonte independente: '+fundEscape(v.source)+'</p>':'')+'</li>').join('')+'</ul><form id="check-form" class="workspace-card"><label for="check-note">O que foi conferido e qual foi o resultado?</label><textarea id="check-note" required minlength="10" maxlength="2000"></textarea><label class="check-label"><input type="checkbox" id="check-external"><span>Realizei contato com clínica ou fornecedor por fonte independente.</span></label><label for="check-source">Fonte do contato (se houve confirmação externa)</label><input id="check-source" maxlength="500"><small>Registre apenas verificações que você realmente realizou. Estes registros são privados.</small><button type="submit" class="btn btn-outline">Registrar verificação</button></form><form id="decision-form" class="workspace-card"><label for="review-decision">Decisão</label><select id="review-decision">'+
      (c.status==='review'?'<option value="changes">Pedir ajustes</option><option value="approve">Aprovar versão proposta</option><option value="reject">Reprovar solicitação</option>':'')+
      (c.approved&&c.liveState!=='closed'?'<option value="pause">Pausar recebimento</option><option value="close">Encerrar campanha</option>'+(c.liveState==='paused'?'<option value="resume">Reativar versão aprovada</option>':''):'')+
      '</select><label for="review-reason">Justificativa para o responsável</label><textarea id="review-reason" maxlength="1500"></textarea><label for="review-summary">Resumo público do que foi analisado (ao aprovar)</label><textarea id="review-summary" maxlength="600" placeholder="Descreva as evidências analisadas e o alcance da conferência."></textarea><small>Não inclua dados privados ou selos de garantia. O sistema registra automaticamente o administrador e a data.</small><button class="btn btn-primary" type="submit">Registrar decisão</button></form>':'');
  document.getElementById('check-form')?.addEventListener('submit',async e=>{
    e.preventDefault();const btn=e.target.querySelector('button');btn.disabled=true;
    try{currentReview=await fundApi('POST','/api/campaigns/'+c.id+'/checks',{revision:currentReview.revision,note:document.getElementById('check-note').value,external:document.getElementById('check-external').checked,source:document.getElementById('check-source').value});renderReview();await loadWorkspace();}
    catch(err){fundError(err,'review-error');btn.disabled=false;}
  });
  document.getElementById('decision-form')?.addEventListener('submit',async e=>{
    e.preventDefault();const btn=e.target.querySelector('button');btn.disabled=true;
    try{currentReview=await fundApi('POST','/api/campaigns/'+c.id+'/review',{revision:currentReview.revision,decision:document.getElementById('review-decision').value,reason:document.getElementById('review-reason').value,summary:document.getElementById('review-summary').value});renderReview();await loadWorkspace();}
    catch(err){fundError(err,'review-error');btn.disabled=false;}
  });
}
document.addEventListener('DOMContentLoaded',async()=>{
  const user=Auth.requireAuth();if(!user)return;
  workspaceAdmin=new URLSearchParams(location.search).get('admin')==='1'&&user.role==='admin';
  if(workspaceAdmin){document.getElementById('workspace-title').textContent='Análise de campanhas';document.getElementById('workspace-eyebrow').textContent='Administração';document.getElementById('workspace-description').textContent='Confira evidências, registre verificações e acompanhe as versões aprovadas.';document.getElementById('workflow-filter').value='review';}
  document.getElementById('workflow-filter').addEventListener('change',renderWorkspace);
  document.getElementById('workspace-list').addEventListener('click',async e=>{const button=e.target.closest('[data-review]');if(button){try{await openReview(button.dataset.review);}catch(err){fundError(err);}}});
  document.getElementById('close-review').addEventListener('click',()=>document.getElementById('campaign-review').close());
  try{await loadWorkspace();}catch(e){fundError(e);}
});
