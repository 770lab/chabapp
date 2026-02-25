// ─── KRIAT CHEMA AL HAMITA MODULE ───
(function(){
var KCHM_DATA=null;

var kchmLangs={he:true,ph:true,fr:false};

function loadKchmData(){
  if(KCHM_DATA)return Promise.resolve(KCHM_DATA);
  return fetch('kriat_chema_complete.json')
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(data){KCHM_DATA=data;return data;})
    .catch(function(err){
      console.warn('Kriat Chema fetch error:',err);
      var c=document.getElementById('kchm-content');
      if(c)c.innerHTML='<div style="text-align:center;color:var(--gray-3);padding:20px;font-size:13px;">Impossible de charger la prière. Vérifiez votre connexion.</div>';
      return null;
    });
}

window.kchmToggle=function(lang){
  kchmLangs[lang]=!kchmLangs[lang];
  var btns=document.querySelectorAll('#kchm-lang-toggles .kchm-lang');
  btns.forEach(function(b){
    var l=b.getAttribute('data-lang');
    if(kchmLangs[l]){b.classList.add('active');b.style.background='var(--black)';b.style.color='#fff';b.style.borderColor='var(--black)';}
    else{b.classList.remove('active');b.style.background='var(--white)';b.style.color='var(--gray-3)';b.style.borderColor='var(--gray-5)';}
  });
  renderKchm();
};

window.kchmToggleSection=function(id){
  var el=document.getElementById('kchm-s-'+id);
  if(el)el.classList.toggle('open');
};

function renderKchm(){
  var c=document.getElementById('kchm-content');
  if(!c||!KCHM_DATA)return;
  var html='';
  KCHM_DATA.sections.forEach(function(s,i){
    var hasOmit=s.omit_on&&s.omit_on.length>0;
    var sub=s.title_hebrew||s.title_french||'';
    html+='<div class="kchm-section" id="kchm-s-'+s.id+'">';
    html+='<div class="kchm-section-header" onclick="kchmToggleSection(\''+s.id+'\')">';
    html+='<div class="kchm-section-num">'+(i+1)+'</div>';
    html+='<div class="kchm-section-info">';
    html+='<div class="kchm-section-title">'+s.title;
    if(hasOmit)html+=' <span class="kchm-omit-badge">Chabbat ✗</span>';
    if(s.repeat)html+=' <span class="kchm-repeat-badge">×'+s.repeat+'</span>';
    html+='</div>';
    if(sub)html+='<div class="kchm-section-sub">'+sub+'</div>';
    html+='</div>';
    html+='<svg class="kchm-section-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    html+='</div>';
    html+='<div class="kchm-section-body">';
    if(s.instruction)html+='<div class="kchm-instruction">📋 '+s.instruction+'</div>';
    if(s.paragraphs){
      s.paragraphs.forEach(function(p){
        html+='<div class="kchm-para-title">'+p.title+(p.source?' <span style="font-weight:400;color:var(--gray-4);font-size:11px;">('+p.source+')</span>':'')+'</div>';
        if(kchmLangs.he)html+='<div class="kchm-he">'+p.hebrew+'</div>';
        if(kchmLangs.ph)html+='<div class="kchm-ph">'+p.phonetic+'</div>';
        if(kchmLangs.fr)html+='<div class="kchm-fr">'+p.french+'</div>';
        if(p.instruction_after){
          html+='<div style="font-size:12px;color:var(--gray-3);font-style:italic;margin:6px 0;">'+p.instruction_after+'</div>';
        }
        if(p.response_hebrew||p.response_phonetic){
          html+='<div class="kchm-response">';
          if(kchmLangs.he&&p.response_hebrew)html+='<div class="kchm-he" style="margin-bottom:4px;">'+p.response_hebrew+'</div>';
          if(kchmLangs.ph&&p.response_phonetic)html+='<div class="kchm-ph" style="margin-bottom:4px;">'+p.response_phonetic+'</div>';
          if(kchmLangs.fr&&p.response_french)html+='<div class="kchm-fr" style="margin-bottom:0;">'+p.response_french+'</div>';
          html+='</div>';
        }
      });
    }else{
      if(s.source)html+='<div class="kchm-source">📖 '+s.source+'</div>';
      if(kchmLangs.he)html+='<div class="kchm-he">'+s.hebrew+'</div>';
      if(kchmLangs.ph)html+='<div class="kchm-ph">'+s.phonetic+'</div>';
      if(kchmLangs.fr)html+='<div class="kchm-fr">'+s.french+'</div>';
    }
    html+='</div></div>';
  });
  c.innerHTML=html;
}

function renderKchmLaws(){
  var c=document.getElementById('kchm-laws-content');
  if(!c||!KCHM_DATA||!KCHM_DATA.laws)return;
  var laws=KCHM_DATA.laws;
  var html='';
  var icons={'when':'🕐','position':'🧍','shabbat_yom_tov':'✡️','first_night_pesach':'🍷','after_hamapil':'🤫','three_paragraphs':'📖','248_words':'🔢'};
  for(var k in laws){
    html+='<div style="margin-bottom:10px;display:flex;gap:8px;align-items:flex-start;">';
    html+='<span style="flex-shrink:0;">'+(icons[k]||'•')+'</span>';
    html+='<span>'+laws[k]+'</span>';
    html+='</div>';
  }
  c.innerHTML=html;
}

// ============= BRACHOT =============
var BRACHOT_DATA=null;
var brachotLangs={he:true,ph:true,fr:false};

function loadBrachotData(){
  if(BRACHOT_DATA)return Promise.resolve(BRACHOT_DATA);
  return fetch('brachot_complete.json')
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(data){BRACHOT_DATA=data;return data;})
    .catch(function(err){
      console.warn('Brachot fetch error:',err);
      var c=document.getElementById('brachot-content');
      if(c)c.innerHTML='<div style="text-align:center;color:var(--gray-3);padding:20px;font-size:13px;">Impossible de charger les brakhot. Vérifiez votre connexion.</div>';
      return null;
    });
}

window.brachotToggle=function(lang){
  brachotLangs[lang]=!brachotLangs[lang];
  var btns=document.querySelectorAll('#brachot-lang-toggles .brachot-lang');
  btns.forEach(function(b){
    var l=b.getAttribute('data-lang');
    if(brachotLangs[l]){b.classList.add('active');b.style.background='var(--black)';b.style.color='#fff';b.style.borderColor='var(--black)';}
    else{b.classList.remove('active');b.style.background='var(--white)';b.style.color='var(--gray-3)';b.style.borderColor='var(--gray-5)';}
  });
  renderBrachot();
};

window.brachotToggleCategory=function(catId){
  var el=document.getElementById('brachot-cat-'+catId);
  if(el)el.classList.toggle('open');
};

function renderBrachot(){
  var c=document.getElementById('brachot-content');
  if(!c||!BRACHOT_DATA)return;
  var html='';
  BRACHOT_DATA.categories.forEach(function(cat,ci){
    html+='<div class="kchm-section" id="brachot-cat-'+cat.id+'">';
    html+='<div class="kchm-section-header" onclick="brachotToggleCategory(\''+cat.id+'\')">';
    html+='<div class="kchm-section-num">'+cat.icon+'</div>';
    html+='<div class="kchm-section-info">';
    html+='<div class="kchm-section-title">'+cat.title+'</div>';
    if(cat.description)html+='<div class="kchm-section-sub">'+cat.description+'</div>';
    html+='</div>';
    html+='<svg class="kchm-section-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    html+='</div>';
    html+='<div class="kchm-section-body">';
    cat.brachot.forEach(function(b){
      html+='<div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--gray-5);">';
      html+='<div style="font-size:14px;font-weight:700;color:var(--black);margin-bottom:2px;">'+b.name+'</div>';
      html+='<div style="font-size:11px;color:var(--gray-3);margin-bottom:8px;">'+b.situation+'</div>';
      if(b.examples&&b.examples.length){
        html+='<div style="font-size:11px;color:var(--gray-4);margin-bottom:8px;font-style:italic;">Ex : '+(Array.isArray(b.examples)?b.examples.join(', '):b.examples)+'</div>';
      }
      if(brachotLangs.he)html+='<div class="kchm-he" style="font-size:26px;">'+b.hebrew+'</div>';
      if(brachotLangs.ph)html+='<div class="kchm-ph">'+b.phonetic+'</div>';
      if(brachotLangs.fr)html+='<div class="kchm-fr">'+b.french+'</div>';
      if(b.note){
        html+='<div style="font-size:11px;color:var(--gray-3);margin-top:6px;font-style:italic;">📋 '+b.note+'</div>';
      }
      html+='</div>';
    });
    html+='</div></div>';
  });
  c.innerHTML=html;
}

// Hook into switchTab after app.js loads
var _kchmInterval=setInterval(function(){
  if(window.switchTab&&!window._kchmHooked){
    window._kchmHooked=true;
    var _origST=window.switchTab;
    window.switchTab=function(t){
      _origST(t);
      if(t==='sub-tefila-chema-hamita'){
        var c=document.getElementById('kchm-content');
        if(c&&!KCHM_DATA){
          c.innerHTML='<div style="text-align:center;color:var(--gray-3);padding:20px;font-size:13px;">Chargement…</div>';
        }
        loadKchmData().then(function(data){
          if(!data)return;
          renderKchm();renderKchmLaws();
          setTimeout(function(){
            var first=document.getElementById('kchm-s-'+data.sections[0].id);
            if(first&&!first.classList.contains('open'))first.classList.add('open');
          },100);
        });
      }
      if(t==='sub-tefila-brachot'){
        var bc=document.getElementById('brachot-content');
        if(bc&&!BRACHOT_DATA){
          bc.innerHTML='<div style="text-align:center;color:var(--gray-3);padding:20px;font-size:13px;">Chargement…</div>';
        }
        loadBrachotData().then(function(data){
          if(!data)return;
          renderBrachot();
        });
      }
    };
    clearInterval(_kchmInterval);
  }
},200);
})();
