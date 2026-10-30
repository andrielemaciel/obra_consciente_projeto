const API = 'http://localhost:3000/api';
let token = localStorage.getItem('oc_token') || '';
let usuario = null;
try {
  const usuarioSalvo = JSON.parse(localStorage.getItem('oc_usuario') || 'null');
  if (usuarioSalvo && typeof usuarioSalvo.nome === 'string' && typeof usuarioSalvo.perfil === 'string') {
    usuario = usuarioSalvo;
  } else if (usuarioSalvo) {
    throw new Error('Dados de sessão inválidos.');
  }
} catch {
  token = '';
  localStorage.removeItem('oc_token');
  localStorage.removeItem('oc_usuario');
}
let materiais = [];
const $ = (s) => document.querySelector(s);
const podeEditar = () => usuario && ['admin', 'estoquista'].includes(usuario.perfil);
const podeExcluir = () => usuario && usuario.perfil === 'admin';
function mensagem(el, texto, sucesso=false) { el.textContent = texto; el.classList.toggle('sucesso', sucesso); }
function toast(texto) { const el=$('#toast'); el.textContent=texto; el.classList.add('visivel'); setTimeout(()=>el.classList.remove('visivel'),3000); }
async function api(caminho, opcoes={}) {
  const headers = { 'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(opcoes.headers||{}) };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const resposta = await fetch(`${API}${caminho}`, {...opcoes, headers, signal:controller.signal});
    const dados = await resposta.json().catch(()=>({}));
    if (!resposta.ok) throw new Error(dados.erro || 'Ocorreu um erro na solicitação.');
    return dados;
  } catch (erro) {
    if (erro.name === 'AbortError') throw new Error('A API demorou para responder. Verifique a conexão e tente novamente.');
    if (erro instanceof TypeError) throw new Error('Não foi possível conectar à API. Confira se o backend está rodando.');
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}
function mostrarAuth(tipo='login') {
  $('#auth-view').classList.remove('hidden'); $('#app-view').classList.add('hidden'); $('#usuario-topo').classList.add('hidden');
  $('#login-form').classList.toggle('hidden', tipo!=='login'); $('#cadastro-form').classList.toggle('hidden', tipo!=='cadastro');
  document.querySelectorAll('[data-auth]').forEach(b=>b.classList.toggle('ativa',b.dataset.auth===tipo)); mensagem($('#auth-msg'),'');
}
function entrarNoApp() {
  $('#auth-view').classList.add('hidden'); $('#app-view').classList.remove('hidden'); $('#usuario-topo').classList.remove('hidden');
  $('#usuario-topo').textContent=`${usuario.nome} · ${rotuloPerfil(usuario.perfil)}`;
  $('#novo-btn').classList.toggle('hidden',!podeEditar()); $('#mov-form').classList.toggle('hidden',!podeEditar()); $('#somente-consulta').classList.toggle('hidden',podeEditar());
  carregarTudo();
}
function rotuloPerfil(p){return ({admin:'Administrador',estoquista:'Responsável pelo estoque',consulta:'Consulta'})[p]||p;}
function formatarQtd(n){return Number(n).toLocaleString('pt-BR',{maximumFractionDigits:2});}
function escapar(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function exibirErroMateriais(erro) {
  const tbody = $('#materiais-tbody');
  const linha = document.createElement('tr');
  const celula = document.createElement('td');
  celula.colSpan = 6;
  celula.textContent = `Não foi possível carregar os materiais: ${erro}`;
  linha.append(celula);
  tbody.replaceChildren(linha);
  $('#materiais-vazio').classList.add('hidden');
  $('#total-materiais').textContent = '—';
  $('#total-baixo').textContent = '—';
}
async function carregarTudo() {
  const resultados = await Promise.allSettled([
    api('/materiais'),
    api('/movimentacoes')
  ]);
  const erros = [];

  if (resultados[0].status === 'fulfilled') {
    const lista = resultados[0].value;
    materiais = lista;
    renderMateriais();
    $('#total-materiais').textContent = lista.length;
    $('#total-baixo').textContent = lista.filter(x => Number(x.quantidade) <= Number(x.estoque_minimo)).length;
    preencherSelectMateriais();
  } else {
    exibirErroMateriais(resultados[0].reason.message);
    erros.push(resultados[0].reason.message);
  }

  if (resultados[1].status === 'fulfilled') {
    const movimentacoes = resultados[1].value;
    renderMovimentacoes(movimentacoes);
    $('#total-mov').textContent = movimentacoes.length;
  } else {
    $('#historico').textContent = `Não foi possível carregar o histórico: ${resultados[1].reason.message}`;
    $('#total-mov').textContent = '—';
    erros.push(resultados[1].reason.message);
  }

  if (erros.some(erro => /token|login|entre novamente/i.test(erro))) {
    sair();
    return;
  }
  if (erros.length) toast(erros.join(' '));
}
function renderMateriais(){const termo=$('#busca').value.toLowerCase();const baixo=$('#filtro-estoque').value==='baixo';const lista=materiais.filter(m=>(m.nome+' '+m.categoria).toLowerCase().includes(termo)&&(!baixo||Number(m.quantidade)<=Number(m.estoque_minimo)));const tbody=$('#materiais-tbody');tbody.innerHTML=lista.map(m=>{const estaBaixo=Number(m.quantidade)<=Number(m.estoque_minimo);let acoes='—';if(podeEditar()){acoes=`<div class="acoes"><button class="mini-btn" data-editar="${m.id}">Editar</button>${podeExcluir()?`<button class="mini-btn excluir" data-excluir="${m.id}">Excluir</button>`:''}</div>`;}return `<tr><td><div class="nome-material">${escapar(m.nome)}</div><div class="subtexto">${escapar(m.unidade)} · ${escapar(m.descricao||'Sem descrição')}</div></td><td>${escapar(m.categoria)}</td><td><strong>${formatarQtd(m.quantidade)} ${escapar(m.unidade)}</strong></td><td>${formatarQtd(m.estoque_minimo)} ${escapar(m.unidade)}</td><td><span class="badge ${estaBaixo?'baixo':''}">${estaBaixo?'Estoque baixo':'Adequado'}</span></td><td>${acoes}</td></tr>`;}).join('');$('#materiais-vazio').classList.toggle('hidden',lista.length>0);}
function preencherSelectMateriais(){const s=$('#mov-material');const antigo=s.value;s.innerHTML=materiais.map(m=>`<option value="${m.id}">${escapar(m.nome)} (${formatarQtd(m.quantidade)} ${escapar(m.unidade)})</option>`).join('');if(antigo)s.value=antigo;}
function renderMovimentacoes(lista){$('#historico').innerHTML=lista.length?lista.slice(0,12).map(m=>`<div class="mov-item"><div><div class="mov-titulo">${escapar(m.material)}</div><div class="mov-data">${new Date(m.criado_em).toLocaleString('pt-BR')} · ${escapar(m.usuario||'Usuário')}</div>${m.observacao?`<div class="subtexto">${escapar(m.observacao)}</div>`:''}</div><div class="mov-valor ${m.tipo}">${m.tipo==='entrada'?'+':'−'}${formatarQtd(m.quantidade)}</div></div>`).join(''):'<p class="muted">Nenhuma movimentação registrada.</p>';}
function abrirMaterial(m=null){const f=$('#material-form');f.reset();f.elements.id.value=m?.id||'';$('#dialog-titulo').textContent=m?'Editar material':'Novo material';$('#quantidade-inicial-wrap').classList.toggle('hidden',!!m);f.elements.quantidade.required=!m;f.elements.nome.value=m?.nome||'';f.elements.categoria.value=m?.categoria||'Outros';f.elements.unidade.value=m?.unidade||'un';f.elements.quantidade.value=m?.quantidade??0;f.elements.estoque_minimo.value=m?.estoque_minimo??0;f.elements.descricao.value=m?.descricao||'';mensagem($('#material-msg'),'');$('#material-dialog').showModal();}
function sair(){token='';usuario=null;localStorage.removeItem('oc_token');localStorage.removeItem('oc_usuario');mostrarAuth();}
document.querySelectorAll('[data-auth]').forEach(b=>b.addEventListener('click',()=>mostrarAuth(b.dataset.auth)));
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(f)))});token=d.token;usuario=d.usuario;localStorage.setItem('oc_token',token);localStorage.setItem('oc_usuario',JSON.stringify(usuario));f.reset();entrarNoApp();}catch(err){mensagem($('#auth-msg'),err.message);}});
$('#cadastro-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{const d=await api('/auth/cadastro',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(f)))});f.reset();mostrarAuth('login');mensagem($('#auth-msg'),d.mensagem,true);}catch(err){mensagem($('#auth-msg'),err.message);}});
$('#sair-btn').addEventListener('click',sair);$('#novo-btn').addEventListener('click',()=>abrirMaterial());$('#fechar-dialog').addEventListener('click',()=>$('#material-dialog').close());$('#cancelar-dialog').addEventListener('click',()=>$('#material-dialog').close());$('#busca').addEventListener('input',renderMateriais);$('#filtro-estoque').addEventListener('change',renderMateriais);
$('#materiais-tbody').addEventListener('click',async e=>{const ed=e.target.closest('[data-editar]');const del=e.target.closest('[data-excluir]');if(ed){const m=materiais.find(x=>x.id===Number(ed.dataset.editar));if(m)abrirMaterial(m);}if(del){const m=materiais.find(x=>x.id===Number(del.dataset.excluir));if(m&&confirm(`Excluir o material "${m.nome}"?`)){try{await api(`/materiais/${m.id}`,{method:'DELETE'});toast('Material excluído.');carregarTudo();}catch(err){toast(err.message);}}}});
$('#material-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const dados=Object.fromEntries(new FormData(f));const id=dados.id;delete dados.id;dados.estoque_minimo=Number(dados.estoque_minimo);if(!id)dados.quantidade=Number(dados.quantidade);try{await api(id?`/materiais/${id}`:'/materiais',{method:id?'PUT':'POST',body:JSON.stringify(dados)});$('#material-dialog').close();toast(id?'Material atualizado.':'Material cadastrado.');carregarTudo();}catch(err){mensagem($('#material-msg'),err.message);}});
$('#mov-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const dados=Object.fromEntries(new FormData(f));dados.material_id=Number(dados.material_id);dados.quantidade=Number(dados.quantidade);try{const d=await api('/movimentacoes',{method:'POST',body:JSON.stringify(dados)});f.reset();mensagem($('#mov-msg'),`${d.mensagem} Estoque atual: ${formatarQtd(d.quantidade_atual)}.`,true);carregarTudo();}catch(err){mensagem($('#mov-msg'),err.message);}});
if(token&&usuario)entrarNoApp();else { token=''; usuario=null; mostrarAuth(); }
