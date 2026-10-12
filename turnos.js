/*! turnos-justos — cuadrante de turnos repartido con justicia · DataFlow Elegance · MIT */
(function (g) {
  "use strict";

  /**
   * p = { personas:[{nombre, noDisponible:[índices de día]}], dias:int, turnos:["Mañana","Tarde","Noche"],
   *       porTurno:int, descansoTrasNoche:bool, maxPorPersona:int (0 = sin límite) }
   * Reparte cada hueco a la persona disponible con MENOS turnos (y menos de ese tipo).
   */
  function generar(p) {
    var personas = (p.personas || []).filter(function (x) { return String(x.nombre || "").trim(); });
    var dias = parseInt(p.dias, 10) || 7, turnos = p.turnos && p.turnos.length ? p.turnos : ["Mañana", "Tarde", "Noche"];
    var porTurno = parseInt(p.porTurno, 10) || 1, maxP = parseInt(p.maxPorPersona, 10) || 0;
    var noche = turnos[turnos.length - 1], primero = turnos[0];
    if (!personas.length) return { error: "Añade al menos una persona." };

    var cont = {}, porTipo = {};
    personas.forEach(function (x) { cont[x.nombre] = 0; porTipo[x.nombre] = {}; turnos.forEach(function (t) { porTipo[x.nombre][t] = 0; }); });
    var cuadrante = [], huecos = 0;

    for (var d = 0; d < dias; d++) {
      var fila = {}, hoy = {};
      turnos.forEach(function (t) {
        fila[t] = [];
        for (var k = 0; k < porTurno; k++) {
          var cands = personas.filter(function (x) {
            if (hoy[x.nombre]) return false;
            if ((x.noDisponible || []).indexOf(d) !== -1) return false;
            if (maxP && cont[x.nombre] >= maxP) return false;
            if (p.descansoTrasNoche && t === primero && d > 0 && cuadrante[d - 1][noche].indexOf(x.nombre) !== -1) return false;
            return true;
          }).sort(function (a, b) {
            return cont[a.nombre] - cont[b.nombre] || porTipo[a.nombre][t] - porTipo[b.nombre][t] || (a.nombre < b.nombre ? -1 : 1);
          });
          if (!cands.length) { fila[t].push("— SIN CUBRIR —"); huecos++; continue; }
          var elegido = cands[0].nombre;
          fila[t].push(elegido); hoy[elegido] = true; cont[elegido]++; porTipo[elegido][t]++;
        }
      });
      cuadrante.push(fila);
    }
    var valores = Object.keys(cont).map(function (k) { return cont[k]; });
    return { cuadrante: cuadrante, turnos_por_persona: cont, por_tipo: porTipo, huecos_sin_cubrir: huecos,
      diferencia_max_min: Math.max.apply(null, valores) - Math.min.apply(null, valores) };
  }

  g.TurnosJustos = { generar: generar };
})(typeof window !== "undefined" ? window : globalThis);
