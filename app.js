// Salario Mínimo Mensual Legal Vigente 2026 en Colombia ($1,750,905.00 COP)
const SMMLV = 1750905;

const state = {
  pasoActual: 1,
  ingreso: 2 * SMMLV, // $3.501.810 (2 SMMLV)
  tieneCaja: true,
  grupoTexto: 'Grupo 2',
  percentil: 62,
  subsidioSM: 30,
  subsidioEstimado: 30 * SMMLV, // $52.527.150
  valorCasa: 135 * SMMLV, // $236.372.175 (135 SMMLV)
  porcentajeInicial: 30,
  plazoAnios: 20,
  tasaEA: 11.5,
  abonoExtra: 180000,
  endosoSeguros: true,
  compraCartera: false,
};

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function formatCOP(valor) {
  return copFormatter.format(Math.round(valor));
}

function formatMillones(valor) {
  return `$${(valor / 1000000).toFixed(1)}M`;
}

function tasaEAaMV(tasaEA) {
  return Math.pow(1 + tasaEA / 100, 1 / 12) - 1;
}

function calcularCuotaFija(prestamo, tasaMV, meses) {
  if (prestamo <= 0 || meses <= 0) return 0;
  if (tasaMV === 0) return prestamo / meses;
  const factor = Math.pow(1 + tasaMV, meses);
  return prestamo * ((tasaMV * factor) / (factor - 1));
}

function simularCredito(prestamo, tasaEA, mesesMax, abonoExtraMensual, factorSeguroMensual) {
  const tasaMV = tasaEAaMV(tasaEA);
  const cuotaBase = calcularCuotaFija(prestamo, tasaMV, mesesMax);

  let saldo = prestamo;
  let mes = 0;
  let totalIntereses = 0;
  let totalSeguros = 0;
  let totalPagado = 0;

  while (saldo > 1 && mes < mesesMax) {
    mes++;
    const interesMes = saldo * tasaMV;
    const seguroMes = Math.max(prestamo * factorSeguroMensual * 0.65, saldo * factorSeguroMensual);

    let abonoTotalCapital = cuotaBase - interesMes + abonoExtraMensual;
    if (abonoTotalCapital > saldo) abonoTotalCapital = saldo;

    saldo -= abonoTotalCapital;
    totalIntereses += interesMes;
    totalSeguros += seguroMes;
    totalPagado += interesMes + seguroMes + abonoTotalCapital;
  }

  const seguroPrimerMes = prestamo * factorSeguroMensual;
  return {
    cuotaCredito: cuotaBase,
    seguroMensualInicial: seguroPrimerMes,
    cuotaTotalInicial: cuotaBase + seguroPrimerMes,
    mesesReales: mes,
    totalIntereses,
    totalSeguros,
    totalPagado,
  };
}

// Diccionario de Ventanas Emergentes (Popups al hacer clic)
const POPUP_INFO = {
  panorama_colombia: {
    icon: '🇨🇴',
    title: 'Radiografía de Vivienda en Colombia',
    msg: 'Según el DANE y FIVI, solo el 39% de los hogares tiene vivienda propia pagada y el 40,3% vive en arriendo. Cada año se financian unas 107.240 viviendas nuevas VIS que benefician a cerca de 306.706 colombianos (con un promedio de 2,86 personas por hogar).',
    tip: 'Ve al Tab 5 (Resumen) para ver la tabla completa de desembolsos VIS y beneficiarios.',
  },
  smmlv: {
    icon: '💵',
    title: '¿Qué es 1 SMMLV en 2026?',
    msg: 'Significa Salario Mínimo Mensual Legal Vigente y para 2026 equivale a $1.750.905,00. En Colombia tanto el precio máximo de las casas VIS como el valor de los subsidios se calculan en salarios mínimos.',
    tip: 'Ojo: Las constructoras ajustan el precio final al salario mínimo del año en que firmas escrituras.',
  },
  vis: {
    icon: '🏘️',
    title: 'Diferencia entre Vivienda VIP y VIS (2026)',
    msg: 'La Vivienda de Interés Prioritario (VIP) tiene un tope de 90 SMMLV ($157.581.450). La Vivienda de Interés Social (VIS) llega hasta 135 SMMLV ($236.372.175) o 150 SMMLV ($262.635.750) en grandes aglomeraciones urbanas.',
    tip: 'Comprar VIS te da tasas de interés más bajas y acceso a subsidios para la cuota inicial.',
  },
  plazo_vs_cuota: {
    icon: '⭐',
    title: '¿Abonar para bajar plazo o bajar cuota?',
    msg: 'Por la Ley 546 de 1999 puedes hacer abonos extra sin multas. Cuando vayas al banco o pagues por la app, elige siempre "Reducir el número de cuotas (plazo)". Así matas años enteros de intereses.',
    tip: 'Si eliges bajar el valor de la cuota, seguirás endeudado los mismos 20 años pagando casi los mismos intereses.',
  },
  mora_30: {
    icon: '⏳',
    title: 'Días 1 a 30 de atraso: ¿Qué pasa?',
    msg: 'Recibirás llamadas o mensajes de recordatorio del banco. Ningún banco puede quitarte tu casa por atrasarte un mes, y por ley el interés de mora SOLO se calcula sobre el capital de la cuota vencida, jamás sobre toda la deuda.',
    tip: 'Consejo: Si sabes que te vas a demorar unos días, avisa al banco antes de la fecha límite.',
  },
  mora_90: {
    icon: '📩',
    title: 'Días 30 a 90: Cobro Prejurídico y Datacrédito',
    msg: 'Tu deuda pasa a una casa de cobranza externa. Para reportarte negativamente en centrales de riesgo (Datacrédito/TransUnion), la Ley de Habeas Data obliga al banco a enviarte un aviso previo 20 días antes.',
    tip: 'Si te quedaste sin trabajo, pide activar el seguro de desempleo de tu crédito o usa tus cesantías.',
  },
  mora_juridico: {
    icon: '⚖️',
    title: 'Más de 90 días: Proceso Jurídico y Embargo',
    msg: 'El banco puede iniciar una demanda ejecutiva hipotecaria ante un juez civil para embargar el inmueble. Pero aún estás a tiempo de detener el proceso.',
    tip: 'Tu defensa legal: Solicita una reestructuración del crédito o acógete a la Ley de Insolvencia de Persona Natural en un centro de conciliación para frenar el embargo.',
  },
  uvr: {
    icon: '📈',
    title: 'Crédito en Pesos Fijos vs. UVR',
    msg: 'En Pesos conoces tu cuota exacta de principio a fin. En UVR (Unidad de Valor Real) la primera cuota parece más barata, pero tanto tu cuota mensual como el saldo total de la deuda suben cada mes con la inflación.',
    tip: 'Si ya tienes un crédito en UVR, puedes pedirle al banco cambiarlo a Pesos sin costo.',
  },
  fiducia: {
    icon: '🔒',
    title: '¿Qué es el Encargo Fiduciario (Fiducia)?',
    msg: 'Cuando compras sobre planos, tu cuota inicial no va directo a la cuenta de la constructora, sino a una Fiduciaria vigilada por el Estado que protege tu dinero hasta que el proyecto cumpla los requisitos para construirse.',
    tip: 'Nunca entregues dinero de cuota inicial a cuentas personales por fuera de la fiducia.',
  },
  escrituras: {
    icon: '📝',
    title: 'Gastos de Escrituración y Registro',
    msg: 'Además del 30% de la cuota inicial, debes ahorrar entre un 3% y un 4% adicional del valor de la vivienda para pagar gastos de Notaría, Beneficencia, Registro de Instrumentos Públicos y avalúo bancario.',
    tip: 'En viviendas VIS tienes descuentos especiales por ley en los derechos notariales y de registro.',
  },
  endoso: {
    icon: '🛡️',
    title: 'Endoso de Seguros (Ahorra hasta 40%)',
    msg: 'Todo crédito hipotecario exige seguro de vida y de incendio/terremoto. No estás obligado a pagar el que te vende el banco: puedes cotizar la misma póliza en una aseguradora externa más económica y endosarla a favor del banco.',
    tip: 'Es un derecho protegido por la Superintendencia Financiera y el banco no puede negarse.',
  },
  cesantias: {
    icon: '💼',
    title: 'Seguro de Desempleo y Uso de Cesantías',
    msg: 'Tus cesantías sirven tanto para completar la cuota inicial como para hacer abonos anuales a capital o cubrir cuotas en momentos difíciles. Además, revisa si tu banco incluyó cobertura de desempleo (cubre hasta 6 cuotas).',
    tip: 'Abonar tus cesantías a capital cada mes de febrero reduce drásticamente los años de tu crédito.',
  },
};

function abrirVentanaEmergente(clave) {
  const info = POPUP_INFO[clave];
  if (!info) return;

  document.getElementById('popup-icon').textContent = info.icon;
  document.getElementById('popup-title').textContent = info.title;
  document.getElementById('popup-message').textContent = info.msg;

  const tipBox = document.getElementById('popup-tip-box');
  const tipText = document.getElementById('popup-tip-text');
  if (info.tip) {
    tipText.textContent = `💡 ${info.tip}`;
    tipBox.hidden = false;
  } else {
    tipBox.hidden = true;
  }

  const overlay = document.getElementById('popup-overlay');
  overlay.hidden = false;
  document.getElementById('popup-btn-ok').focus();
}

function cerrarVentanaEmergente() {
  document.getElementById('popup-overlay').hidden = true;
}

// Calcular el percentil aproximado en la distribución de ingresos de hogares en Colombia (DANE)
function calcularPercentilColombia(smmlvs) {
  if (smmlvs <= 1.0) {
    return Math.max(5, Math.round(smmlvs * 35));
  }
  if (smmlvs <= 2.0) {
    return Math.round(35 + (smmlvs - 1.0) * 33);
  }
  if (smmlvs <= 4.0) {
    return Math.round(68 + ((smmlvs - 2.0) / 2.0) * 20);
  }
  return Math.min(99, Math.round(88 + ((smmlvs - 4.0) / 5.0) * 11));
}

// Cambiar entre los 5 Tabs
function irAPaso(numPaso) {
  state.pasoActual = Math.max(1, Math.min(5, numPaso));

  document.querySelectorAll('.step-view').forEach((sec, idx) => {
    sec.classList.toggle('active', idx + 1 === state.pasoActual);
  });

  document.querySelectorAll('.step-pill').forEach((pill) => {
    pill.classList.toggle('active', Number(pill.dataset.step) === state.pasoActual);
  });

  document.getElementById('step-indicator').textContent = `Paso ${state.pasoActual} de 5`;
  document.getElementById('btn-prev').disabled = state.pasoActual === 1;

  const btnNext = document.getElementById('btn-next');
  if (state.pasoActual === 5) {
    btnNext.textContent = 'Volver al inicio ↺';
  } else {
    btnNext.textContent = 'Siguiente paso →';
  }
}

// Actualizar Tab 1: Grupo y Percentil en Colombia (con SMMLV 2026)
function actualizarGrupoColombia() {
  const smmlvs = state.ingreso / SMMLV;
  const percentil = calcularPercentilColombia(smmlvs);
  state.percentil = percentil;

  document.getElementById('display-ingreso').textContent = formatCOP(state.ingreso);
  document.getElementById('ingreso-smmlv-badge').textContent = `${smmlvs.toFixed(1)} SMMLV · Percentil ${percentil}`;

  const elTitulo = document.getElementById('grupo-titulo');
  const elDesc = document.getElementById('grupo-descripcion');
  const elMarker = document.getElementById('grupo-marker');

  let subsidioSM = 0;

  if (smmlvs <= 1.2) {
    subsidioSM = 30;
    state.grupoTexto = 'Grupo 1 (Prioridad Alta)';
    elTitulo.textContent = 'Grupo 1 · Prioridad Alta (35% del país)';
    elDesc.innerHTML = `Superas al <strong>${percentil}%</strong> de los hogares. Tienes el mayor subsidio (<strong>30 SMMLV</strong>). Unir ingresos en familia ayuda a la aprobación bancaria.`;
  } else if (smmlvs <= 2.0) {
    subsidioSM = 30;
    state.grupoTexto = 'Grupo 2 (Acceso VIS Ideal)';
    elTitulo.textContent = 'Grupo 2 · Ideal para Subsidio VIS (33% del país)';
    elDesc.innerHTML = `Estás en el <strong>percentil ${percentil}</strong> de Colombia. Recibes <strong>30 SMMLV</strong> de subsidio y tienes capacidad para financiar vivienda VIP o VIS.`;
  } else if (smmlvs <= 4.0) {
    subsidioSM = 20;
    state.grupoTexto = 'Grupo 3 (Clase Media VIS)';
    elTitulo.textContent = 'Grupo 3 · Clase Media VIS (20% del país)';
    elDesc.innerHTML = `Estás en el <strong>percentil ${percentil}</strong> (ganas más que el ${percentil}% de hogares). Recibes <strong>20 SMMLV</strong> de subsidio para cuota inicial.`;
  } else {
    subsidioSM = 0;
    state.grupoTexto = 'Grupo 4 (Top 12% Nacional)';
    elTitulo.textContent = 'Grupo 4 · Top 12% de ingresos en Colombia';
    elDesc.innerHTML = `Estás en el <strong>percentil ${percentil}</strong> del país. Superas el tope de 4 SMMLV para subsidios, pero tienes alta aprobación hipotecaria.`;
  }

  state.subsidioSM = subsidioSM;
  state.subsidioEstimado = subsidioSM * SMMLV;
  elMarker.style.left = `${Math.max(6, Math.min(95, percentil))}%`;

  document.getElementById('grupo-subsidio').textContent = formatCOP(state.subsidioEstimado);
  document.getElementById('grupo-subsidio-detalle').textContent =
    subsidioSM > 0
      ? state.tieneCaja
        ? `${subsidioSM} SMMLV con Caja de Compensación`
        : `${subsidioSM} SMMLV en programas estatales`
      : 'Sin subsidio por superar 4 SMMLV';

  const cuotaMaxima = state.ingreso * 0.4;
  document.getElementById('grupo-cuota-max').textContent = `${formatCOP(cuotaMaxima)}/mes`;
}

// Actualizar Tab 2 (Calculadora), Tab 3 (Trucos) y Tab 5 (Resumen General)
function actualizarCalculadoraYTrucos() {
  const smmlvCasa = Math.round(state.valorCasa / SMMLV);
  document.getElementById('display-valor-casa').textContent = formatCOP(state.valorCasa);
  document.getElementById('casa-smmlv-badge').textContent = `(${smmlvCasa} SMMLV)`;

  const valorCuotaInicial = state.valorCasa * (state.porcentajeInicial / 100);
  const montoPrestamo = state.valorCasa - valorCuotaInicial;
  const mesesTotales = state.plazoAnios * 12;

  document.getElementById('inicial-porcentaje-badge').textContent = `${state.porcentajeInicial}%`;
  document.getElementById('display-cuota-inicial').textContent = formatCOP(valorCuotaInicial);
  document.getElementById('display-plazo').textContent = `${state.plazoAnios} años`;
  document.getElementById('display-cuotas-num').textContent = `${mesesTotales} cuotas`;
  document.getElementById('display-tasa').textContent = `${state.tasaEA.toFixed(1)}% E.A.`;
  document.getElementById('display-tasa-mv').textContent = `${(tasaEAaMV(state.tasaEA) * 100).toFixed(2)}%`;

  const factorSeguroBanco = 0.0005;
  const simBase = simularCredito(montoPrestamo, state.tasaEA, mesesTotales, 0, factorSeguroBanco);

  document.getElementById('res-cuota-total').innerHTML = `${formatCOP(simBase.cuotaTotalInicial)} <small>/mes</small>`;

  const interesesYSeguros = simBase.totalIntereses + simBase.totalSeguros;
  document.getElementById('res-prestamo').textContent = formatMillones(montoPrestamo);
  document.getElementById('res-intereses').textContent = formatMillones(interesesYSeguros);

  const pctCap = Math.round((montoPrestamo / simBase.totalPagado) * 100);
  document.getElementById('bar-capital').style.width = `${pctCap}%`;
  document.getElementById('bar-interest').style.width = `${100 - pctCap}%`;

  document.getElementById('res-total-banco').textContent = formatCOP(simBase.totalPagado);
  const mult = (simBase.totalPagado / montoPrestamo).toFixed(2);
  document.getElementById('res-multiplicador').textContent = `${mult}x lo prestado`;

  // Viabilidad frente al ingreso del Paso 1
  const pillViabilidad = document.getElementById('viabilidad-pill');
  const cuotaMaxLey = state.ingreso * 0.4;
  if (simBase.cuotaTotalInicial <= cuotaMaxLey) {
    pillViabilidad.classList.remove('warn');
    const pctUso = Math.round((simBase.cuotaTotalInicial / state.ingreso) * 100);
    pillViabilidad.textContent = `✅ Viable (${pctUso}% de tu ingreso)`;
  } else {
    pillViabilidad.classList.add('warn');
    pillViabilidad.textContent = '⚠️ Supera el 40% de tu ingreso';
  }

  // Tab 3: Simulación con Trucos
  document.getElementById('display-abono-extra').textContent = `+ ${formatCOP(state.abonoExtra)} / mes`;

  const tasaTrucos = state.compraCartera ? Math.max(6.5, state.tasaEA - 1.5) : state.tasaEA;
  const seguroTrucos = state.endosoSeguros ? factorSeguroBanco * 0.6 : factorSeguroBanco;
  const simTrucos = simularCredito(montoPrestamo, tasaTrucos, mesesTotales, state.abonoExtra, seguroTrucos);

  const ahorroPesos = Math.max(0, simBase.totalPagado - simTrucos.totalPagado);
  const cuotasMenos = Math.max(0, mesesTotales - simTrucos.mesesReales);
  const aniosMenos = Math.floor(cuotasMenos / 12);
  const mesesResto = cuotasMenos % 12;

  document.getElementById('truco-ahorro-dinero').textContent = `Te ahorras ${formatCOP(ahorroPesos)}`;
  const tiempoTexto =
    aniosMenos > 0
      ? `${aniosMenos} años y ${mesesResto} meses antes`
      : `${mesesResto} meses antes`;
  document.getElementById('truco-ahorro-tiempo').innerHTML =
    `Terminas de pagar <strong>${tiempoTexto}</strong> (${cuotasMenos} cuotas menos).`;

  document.getElementById('ba-antes-tiempo').textContent = `${state.plazoAnios} años (${mesesTotales} cuotas)`;
  document.getElementById('ba-antes-total').textContent = `Pagas ${formatMillones(simBase.totalPagado)}`;

  const aniosConTrucos = (simTrucos.mesesReales / 12).toFixed(1);
  document.getElementById('ba-despues-tiempo').textContent = `${aniosConTrucos} años (${simTrucos.mesesReales} cuotas)`;
  document.getElementById('ba-despues-total').textContent = `Pagas ${formatMillones(simTrucos.totalPagado)}`;

  // Tab 5: Actualizar el Summary Personalizado
  const smmlvsIngreso = (state.ingreso / SMMLV).toFixed(1);
  document.getElementById('sum-grupo-percentil').textContent = `${state.grupoTexto} · Percentil ${state.percentil}`;
  document.getElementById('sum-ingreso-detalle').textContent = `Ingreso: ${formatCOP(state.ingreso)} (${smmlvsIngreso} SMMLV)`;

  document.getElementById('sum-subsidio').textContent = formatCOP(state.subsidioEstimado);
  document.getElementById('sum-subsidio-sm').textContent =
    state.subsidioSM > 0 ? `${state.subsidioSM} SMMLV de 2026` : 'No aplica (> 4 SMMLV)';

  document.getElementById('sum-casa-prestamo').textContent = `${formatMillones(state.valorCasa)} (Préstamo: ${formatMillones(montoPrestamo)})`;
  document.getElementById('sum-cuota-mensual').textContent = `Inicial: ${state.porcentajeInicial}% · Cuota: ${formatCOP(simBase.cuotaTotalInicial)}/mes`;

  document.getElementById('sum-ahorro-total').textContent = `${formatCOP(ahorroPesos)} ahorrados`;
  document.getElementById('sum-tiempo-ahorrado').textContent = `Pagas en ${aniosConTrucos} años en vez de ${state.plazoAnios} años (-${cuotasMenos} cuotas)`;
}

function initEventos() {
  // Navegación del Stepper (Pasos 1 a 5)
  document.querySelectorAll('.step-pill').forEach((pill) => {
    pill.addEventListener('click', () => irAPaso(Number(pill.dataset.step)));
  });

  document.getElementById('btn-prev').addEventListener('click', () => {
    irAPaso(state.pasoActual - 1);
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    if (state.pasoActual === 5) irAPaso(1);
    else irAPaso(state.pasoActual + 1);
  });

  // Cualquier botón con data-popup-key abre la Ventana Emergente (Modal)
  document.querySelectorAll('[data-popup-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      abrirVentanaEmergente(btn.dataset.popupKey);
    });
  });

  // Cerrar Ventana Emergente
  document.getElementById('popup-close-x').addEventListener('click', cerrarVentanaEmergente);
  document.getElementById('popup-btn-ok').addEventListener('click', cerrarVentanaEmergente);
  document.getElementById('popup-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'popup-overlay') cerrarVentanaEmergente();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarVentanaEmergente();
  });

  // Controles Paso 1: Ingreso y Caja
  const inputIngreso = document.getElementById('input-ingreso');
  inputIngreso.addEventListener('input', (e) => {
    state.ingreso = Number(e.target.value);
    document.querySelectorAll('[data-ingreso]').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.ingreso) === state.ingreso);
    });
    actualizarGrupoColombia();
    actualizarCalculadoraYTrucos();
  });

  document.querySelectorAll('[data-ingreso]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.ingreso = Number(btn.dataset.ingreso);
      inputIngreso.value = state.ingreso;
      document.querySelectorAll('[data-ingreso]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      actualizarGrupoColombia();
      actualizarCalculadoraYTrucos();
    });
  });

  document.querySelectorAll('[data-caja]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tieneCaja = btn.dataset.caja === 'si';
      document.querySelectorAll('[data-caja]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      actualizarGrupoColombia();
      actualizarCalculadoraYTrucos();
    });
  });

  // Controles Paso 2: Calculadora
  const inputValorCasa = document.getElementById('input-valor-casa');
  inputValorCasa.addEventListener('input', (e) => {
    state.valorCasa = Number(e.target.value);
    document.querySelectorAll('[data-casa]').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.casa) === state.valorCasa);
    });
    actualizarCalculadoraYTrucos();
  });

  document.querySelectorAll('[data-casa]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.valorCasa = Number(btn.dataset.casa);
      inputValorCasa.value = state.valorCasa;
      document.querySelectorAll('[data-casa]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      actualizarCalculadoraYTrucos();
    });
  });

  document.getElementById('input-cuota-inicial').addEventListener('input', (e) => {
    state.porcentajeInicial = Number(e.target.value);
    actualizarCalculadoraYTrucos();
  });

  document.getElementById('input-plazo').addEventListener('input', (e) => {
    state.plazoAnios = Number(e.target.value);
    actualizarCalculadoraYTrucos();
  });

  document.getElementById('input-tasa').addEventListener('input', (e) => {
    state.tasaEA = Number(e.target.value);
    actualizarCalculadoraYTrucos();
  });

  // Controles Paso 3: Trucos
  const inputAbono = document.getElementById('input-abono-extra');
  inputAbono.addEventListener('input', (e) => {
    state.abonoExtra = Number(e.target.value);
    document.querySelectorAll('[data-abono]').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.abono) === state.abonoExtra);
    });
    actualizarCalculadoraYTrucos();
  });

  document.querySelectorAll('[data-abono]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.abonoExtra = Number(btn.dataset.abono);
      inputAbono.value = state.abonoExtra;
      document.querySelectorAll('[data-abono]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      actualizarCalculadoraYTrucos();
    });
  });

  document.getElementById('check-endoso').addEventListener('change', (e) => {
    state.endosoSeguros = e.target.checked;
    actualizarCalculadoraYTrucos();
  });

  document.getElementById('check-compra-cartera').addEventListener('change', (e) => {
    state.compraCartera = e.target.checked;
    actualizarCalculadoraYTrucos();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initEventos();
  actualizarGrupoColombia();
  actualizarCalculadoraYTrucos();
});
