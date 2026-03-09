function shareObjectifs(e){
  if(e)e.stopPropagation();
  var items=document.querySelectorAll('#obj-list .obj-item');
  var counter=document.getElementById('obj-counter');
  var cText=counter?counter.textContent:'';
  var today=new Date();
  var dateStr=today.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var lines=['📋 Mes objectifs du jour','📅 '+dateStr,'─────────────────'];
  items.forEach(function(item){
    var checked=item.classList.contains('checked')||item.querySelector('input[type=checkbox]:checked');
    var label=item.querySelector('.obj-label,.obj-text,label,span');
    var text=label?label.textContent.trim():item.textContent.trim();
    if(text)lines.push((checked?'✅':'⬜')+' '+text);
  });
  if(cText)lines.push('─────────────────','📊 Progression : '+cText);
  lines.push('','🕎 KOULAM - koulam.com');
  var shareText=lines.join('\n');
  if(navigator.share){
    navigator.share({title:'Objectifs du jour',text:shareText}).catch(function(){});
  }else{
    navigator.clipboard.writeText(shareText).then(function(){
      var btn=e&&e.currentTarget;
      if(btn){
        var orig=btn.innerHTML;
        btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
        setTimeout(function(){btn.innerHTML=orig;},1500);
      }
    }).catch(function(){});
  }
}
