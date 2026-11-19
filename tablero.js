// Tablero en vivo · Masterclass 26 de noviembre.
// Lee solo agregados (conteos y promedios) desde Apps Script. Sin cookies: funciona aunque el navegador
// tenga varias cuentas de Google abiertas. ?desde=todo muestra también las respuestas de prueba.
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwCkG6BM_4gpU7ZuaXFsrurHyEWdx-4SdpjcBKvuiRn-ol-KaFcOE5TZ5a0hMln3q2Uqg/exec';
  var REFRESCO = 8000;
  var DESDE = new URLSearchParams(location.search).get('desde') === 'todo' ? 'todo' : 'sesion';
  var NIV = [['Explorador', '0–39', '#94A3B8'], ['Experimentador', '40–59', '#C9A227'], ['Integrador', '60–79', '#2DD4BF'], ['Transformador', '80–100', '#F1F5F9']];

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var armado = false;

  // Arma la estructura una sola vez; después solo cambian cifras y anchos (las barras se deslizan, no parpadean).
  function armar(d) {
    document.getElementById('niveles').innerHTML = NIV.map(function (n) {
      return '<div class="nivel"><div class="nombre t">' + n[0] + '<span class="rango">' + n[1] + ' puntos</span></div>' +
        '<div class="pista"><div class="barra" style="background:' + n[2] + '"></div></div>' +
        '<div class="num t"><span class="v">0</span><small><span class="p">0</span> %</small></div></div>';
    }).join('');
    document.getElementById('dims').innerHTML = d.dimensiones.map(function (x) {
      return '<div class="dim"><div class="fila"><span>' + esc(x.nombre) + '</span><b class="v">0</b></div>' +
        '<div class="pista"><div class="barra"></div></div></div>';
    }).join('');
    armado = true;
  }

  function pintar(d) {
    if (!armado) armar(d);
    document.getElementById('total').textContent = d.total;
    document.getElementById('prom').innerHTML = esc(d.promedio) + '<small>/100</small>';
    var max = Math.max(1, NIV.reduce(function (m, n) { return Math.max(m, d.niveles[n[0]] || 0); }, 0));
    var filas = document.querySelectorAll('#niveles .nivel');
    var dims = document.querySelectorAll('#dims .dim');
    setTimeout(function () {
      NIV.forEach(function (n, i) {
        var v = Number(d.niveles[n[0]]) || 0;
        filas[i].querySelector('.v').textContent = v;
        filas[i].querySelector('.p').textContent = d.total ? Math.round(v * 100 / d.total) : 0;
        filas[i].querySelector('.barra').style.width = (v * 100 / max) + '%';
      });
      d.dimensiones.forEach(function (x, i) {
        if (!dims[i]) return;
        dims[i].querySelector('.v').textContent = x.valor;
        dims[i].querySelector('.barra').style.width = (Number(x.valor) || 0) + '%';
      });
    }, 60);
    document.getElementById('hora').textContent = 'Actualizado ' + d.hora;
    document.getElementById('modo').textContent = 'Datos: ' + d.modo;
  }

  function cargar() {
    fetch(ENDPOINT + '?formato=json&desde=' + DESDE + '&t=' + Date.now(), { credentials: 'omit', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(pintar)
      .catch(function () { document.getElementById('hora').textContent = 'Reintentando…'; })
      .then(function () { setTimeout(cargar, REFRESCO); });
  }
  cargar();
})();
