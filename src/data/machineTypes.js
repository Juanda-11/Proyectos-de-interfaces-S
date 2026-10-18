// Catálogo de equipos configurables. Cada tipo incluye fallas típicas con una lectura simulada del
// sensor y un plan de reparación local. El plan local se usa cuando el backend/IA no está
// disponible (modo sin conexión), así la demo nunca se queda sin respuesta.
//
// Estructura de una falla:
//   id        identificador estable
//   title     título corto (cabe en la pantalla del reloj)
//   metric    magnitud medida por el sensor simulado
//   unit      unidad de la lectura
//   range     [mín, máx] del valor simulado cuando se dispara la falla
//   severity  'medium' | 'high' | 'critical'
//   keywords  palabras que permiten reconocer la falla en texto libre (modo sin conexión)
//   steps     plan local: { title (≤ 34 car.), voice (frase hablada) }

export const MACHINE_TYPES = [
  {
    id: 'boiler',
    label: 'Caldera',
    icon: '🔥',
    sector: 'Industria',
    faults: [
      {
        id: 'boiler-overheat',
        title: 'TEMPERATURA ALTA',
        metric: 'Temperatura',
        unit: '°C',
        range: [92, 105],
        severity: 'high',
        keywords: ['caliente', 'temperatura', 'sobrecalent', 'calor', 'hierve'],
        steps: [
          {
            title: 'Cierra la válvula de vapor',
            voice: 'Paso uno. Cierra la válvula de vapor de la caldera.',
          },
          {
            title: 'Espera 2 minutos a que enfríe',
            voice: 'Paso dos. Espera dos minutos para que baje la temperatura.',
          },
          {
            title: 'Revisa el filtro de aire',
            voice: 'Paso tres. Revisa que el filtro de aire no esté obstruido.',
          },
          {
            title: 'Reinicia y confirma lectura',
            voice: 'Paso cuatro. Reinicia la caldera y confirma que la temperatura sea normal.',
          },
        ],
      },
      {
        id: 'boiler-pressure',
        title: 'PRESIÓN ELEVADA',
        metric: 'Presión',
        unit: ' bar',
        range: [11, 15],
        severity: 'critical',
        keywords: ['presión', 'presion', 'manómetro', 'manometro', 'válvula de seguridad', 'silba'],
        steps: [
          {
            title: 'Aléjate de la línea de vapor',
            voice: 'Paso uno. Aléjate de la línea de vapor y avisa a quienes estén cerca.',
          },
          {
            title: 'Corta el suministro de combustible',
            voice: 'Paso dos. Corta el suministro de combustible del quemador.',
          },
          {
            title: 'Abre la purga con cuidado',
            voice: 'Paso tres. Abre la válvula de purga lentamente hasta que baje la presión.',
          },
          {
            title: 'Avisa a mantenimiento',
            voice:
              'Paso cuatro. No reinicies la caldera. Avisa a mantenimiento para revisar la válvula de seguridad.',
          },
        ],
      },
      {
        id: 'boiler-water',
        title: 'NIVEL DE AGUA BAJO',
        metric: 'Nivel',
        unit: ' %',
        range: [8, 20],
        severity: 'high',
        keywords: ['agua', 'nivel', 'seca', 'vacía', 'vacia'],
        steps: [
          { title: 'Apaga el quemador', voice: 'Paso uno. Apaga el quemador de inmediato.' },
          {
            title: 'No agregues agua fría',
            voice: 'Paso dos. No agregues agua fría con la caldera caliente.',
          },
          {
            title: 'Deja enfriar y revisa la bomba',
            voice:
              'Paso tres. Deja enfriar y revisa que la bomba de alimentación esté funcionando.',
          },
        ],
      },
    ],
  },
  {
    id: 'press',
    label: 'Prensa hidráulica',
    icon: '🗜️',
    sector: 'Industria',
    faults: [
      {
        id: 'press-leak',
        title: 'FUGA DE ACEITE',
        metric: 'Presión de aceite',
        unit: ' bar',
        range: [60, 95],
        severity: 'high',
        keywords: ['aceite', 'fuga', 'gotea', 'derrame', 'mancha', 'hidráulico', 'hidraulico'],
        steps: [
          {
            title: 'Detén la prensa y bloquéala',
            voice: 'Paso uno. Detén la prensa y aplica el bloqueo de energía.',
          },
          {
            title: 'Contén el derrame',
            voice:
              'Paso dos. Coloca material absorbente para contener el aceite y evitar resbalones.',
          },
          {
            title: 'Ubica el punto de fuga',
            voice:
              'Paso tres. Revisa mangueras y conexiones para ubicar la fuga, sin tocar piezas calientes.',
          },
          {
            title: 'Reporta a mantenimiento',
            voice: 'Paso cuatro. Reporta la fuga a mantenimiento antes de volver a operar.',
          },
        ],
      },
      {
        id: 'press-jam',
        title: 'EMBOLO ATASCADO',
        metric: 'Fuerza',
        unit: ' kN',
        range: [820, 990],
        severity: 'critical',
        keywords: ['atasc', 'trab', 'bloque', 'émbolo', 'embolo', 'no baja', 'no sube'],
        steps: [
          {
            title: 'Presiona el paro de emergencia',
            voice:
              'Paso uno. Presiona el paro de emergencia y mantén las manos fuera de la zona de prensado.',
          },
          {
            title: 'Libera la presión residual',
            voice: 'Paso dos. Libera la presión residual con la válvula de alivio.',
          },
          {
            title: 'Retira la pieza con herramienta',
            voice:
              'Paso tres. Retira la pieza atascada usando una herramienta, nunca con las manos.',
          },
        ],
      },
      {
        id: 'press-noise',
        title: 'RUIDO ANORMAL',
        metric: 'Sonido',
        unit: ' dB',
        range: [96, 112],
        severity: 'medium',
        keywords: ['ruido', 'golpeteo', 'chirrido', 'suena', 'sonido', 'metálico', 'metalico'],
        steps: [
          {
            title: 'Detén el ciclo actual',
            voice: 'Paso uno. Termina el ciclo actual y detén la prensa.',
          },
          {
            title: 'Revisa el nivel de aceite',
            voice: 'Paso dos. Revisa que el nivel de aceite hidráulico sea el correcto.',
          },
          {
            title: 'Escucha la bomba',
            voice: 'Paso tres. Enciende en vacío y escucha si el ruido viene de la bomba.',
          },
        ],
      },
    ],
  },
  {
    id: 'cnc',
    label: 'Torno CNC',
    icon: '⚙️',
    sector: 'Industria',
    faults: [
      {
        id: 'cnc-vibration',
        title: 'VIBRACIÓN EXCESIVA',
        metric: 'Vibración',
        unit: ' mm/s',
        range: [7, 12],
        severity: 'high',
        keywords: ['vibra', 'tiembla', 'sacude', 'husillo', 'desbalance'],
        steps: [
          {
            title: 'Reduce la velocidad del husillo',
            voice: 'Paso uno. Reduce la velocidad del husillo al mínimo.',
          },
          {
            title: 'Revisa la sujeción de la pieza',
            voice: 'Paso dos. Detén la máquina y revisa que la pieza esté bien sujeta.',
          },
          {
            title: 'Inspecciona la herramienta',
            voice: 'Paso tres. Inspecciona si la herramienta de corte está desgastada o dañada.',
          },
        ],
      },
      {
        id: 'cnc-coolant',
        title: 'REFRIGERANTE BAJO',
        metric: 'Nivel de refrigerante',
        unit: ' %',
        range: [5, 15],
        severity: 'medium',
        keywords: ['refrigerante', 'taladrina', 'líquido', 'liquido', 'enfriamiento'],
        steps: [
          { title: 'Pausa el programa', voice: 'Paso uno. Pausa el programa de mecanizado.' },
          {
            title: 'Rellena el refrigerante',
            voice: 'Paso dos. Rellena el depósito de refrigerante hasta la marca de nivel.',
          },
          {
            title: 'Reanuda el programa',
            voice: 'Paso tres. Reanuda el programa y observa el flujo en la herramienta.',
          },
        ],
      },
      {
        id: 'cnc-tool',
        title: 'HERRAMIENTA ROTA',
        metric: 'Carga del husillo',
        unit: ' %',
        range: [118, 150],
        severity: 'high',
        keywords: ['herramienta', 'fresa', 'broca', 'rota', 'quebr', 'inserto'],
        steps: [
          { title: 'Para el programa', voice: 'Paso uno. Detén el programa con el botón de paro.' },
          {
            title: 'Abre la puerta con seguridad',
            voice: 'Paso dos. Espera a que el husillo se detenga por completo y abre la puerta.',
          },
          {
            title: 'Cambia la herramienta',
            voice: 'Paso tres. Cambia la herramienta y revisa la pieza por posibles daños.',
          },
        ],
      },
    ],
  },
  {
    id: 'conveyor',
    label: 'Cinta transportadora',
    icon: '📦',
    sector: 'Logística',
    faults: [
      {
        id: 'conveyor-jam',
        title: 'ATASCO EN LA CINTA',
        metric: 'Corriente del motor',
        unit: ' A',
        range: [28, 40],
        severity: 'medium',
        keywords: ['atasco', 'atascada', 'paquete', 'caja', 'no avanza', 'trabada'],
        steps: [
          {
            title: 'Detén la cinta y bloquéala',
            voice: 'Paso uno. Detén la cinta con el paro y aplica el bloqueo de energía.',
          },
          {
            title: 'Retira el objeto atascado',
            voice:
              'Paso dos. Retira la caja o el objeto atascado con las manos fuera de los rodillos.',
          },
          {
            title: 'Reinicia y observa',
            voice: 'Paso tres. Reinicia la cinta y observa que el flujo sea normal.',
          },
        ],
      },
      {
        id: 'conveyor-belt',
        title: 'BANDA DESALINEADA',
        metric: 'Desviación',
        unit: ' mm',
        range: [25, 55],
        severity: 'medium',
        keywords: ['desalinea', 'se corre', 'se va', 'lado', 'banda', 'correa'],
        steps: [
          { title: 'Detén la cinta', voice: 'Paso uno. Detén la cinta y bloquea la energía.' },
          {
            title: 'Ajusta los tensores',
            voice:
              'Paso dos. Ajusta los tensores del lado donde se desvía la banda, media vuelta a la vez.',
          },
          {
            title: 'Prueba en vacío',
            voice: 'Paso tres. Prueba la cinta en vacío antes de cargar producto.',
          },
        ],
      },
      {
        id: 'conveyor-motor',
        title: 'MOTOR SOBRECALENTADO',
        metric: 'Temperatura del motor',
        unit: ' °C',
        range: [88, 110],
        severity: 'high',
        keywords: ['motor', 'caliente', 'huele', 'quemado', 'humo'],
        steps: [
          { title: 'Apaga el motor', voice: 'Paso uno. Apaga el motor y deja que se enfríe.' },
          {
            title: 'Revisa la ventilación',
            voice: 'Paso dos. Verifica que las rejillas de ventilación no estén tapadas.',
          },
          {
            title: 'Avisa a mantenimiento',
            voice:
              'Paso tres. Si el motor huele a quemado, no lo enciendas y avisa a mantenimiento.',
          },
        ],
      },
    ],
  },
  {
    id: 'compressor',
    label: 'Compresor de aire',
    icon: '💨',
    sector: 'Industria',
    faults: [
      {
        id: 'compressor-pressure',
        title: 'PRESIÓN BAJA',
        metric: 'Presión',
        unit: ' bar',
        range: [2, 4],
        severity: 'medium',
        keywords: ['presión', 'presion', 'baja', 'no llena', 'no sube', 'fuga de aire'],
        steps: [
          {
            title: 'Revisa fugas de aire',
            voice: 'Paso uno. Escucha si hay fugas de aire en mangueras y acoples.',
          },
          { title: 'Drena el tanque', voice: 'Paso dos. Drena el agua condensada del tanque.' },
          {
            title: 'Revisa el filtro de admisión',
            voice: 'Paso tres. Revisa que el filtro de admisión esté limpio.',
          },
        ],
      },
      {
        id: 'compressor-overheat',
        title: 'SOBRECALENTAMIENTO',
        metric: 'Temperatura',
        unit: ' °C',
        range: [105, 125],
        severity: 'high',
        keywords: ['caliente', 'temperatura', 'calor', 'sobrecalent', 'térmico', 'termico'],
        steps: [
          {
            title: 'Apaga el compresor',
            voice: 'Paso uno. Apaga el compresor y espera a que se enfríe.',
          },
          {
            title: 'Revisa el nivel de aceite',
            voice: 'Paso dos. Revisa el nivel de aceite del cárter.',
          },
          {
            title: 'Limpia el radiador',
            voice: 'Paso tres. Limpia el polvo del radiador y las aletas de enfriamiento.',
          },
        ],
      },
    ],
  },
  {
    id: 'forklift',
    label: 'Montacargas',
    icon: '🚜',
    sector: 'Logística',
    faults: [
      {
        id: 'forklift-battery',
        title: 'BATERÍA CRÍTICA',
        metric: 'Carga',
        unit: ' %',
        range: [3, 9],
        severity: 'medium',
        keywords: ['batería', 'bateria', 'carga', 'no arranca', 'apaga'],
        steps: [
          {
            title: 'Baja la carga y estaciona',
            voice: 'Paso uno. Baja la carga con cuidado y estaciona el montacargas en zona segura.',
          },
          {
            title: 'Conecta al cargador',
            voice: 'Paso dos. Conecta el montacargas al cargador y verifica la luz de carga.',
          },
          { title: 'Usa otra unidad', voice: 'Paso tres. Pide otra unidad mientras se carga.' },
        ],
      },
      {
        id: 'forklift-hydraulic',
        title: 'MÁSTIL NO ELEVA',
        metric: 'Presión hidráulica',
        unit: ' bar',
        range: [40, 80],
        severity: 'high',
        keywords: ['mástil', 'mastil', 'no sube', 'no eleva', 'horquilla', 'levanta'],
        steps: [
          {
            title: 'Baja las horquillas',
            voice: 'Paso uno. Baja las horquillas al suelo si es posible y retira la carga.',
          },
          {
            title: 'Revisa el nivel hidráulico',
            voice: 'Paso dos. Revisa el nivel de aceite hidráulico.',
          },
          {
            title: 'Retira la unidad de servicio',
            voice:
              'Paso tres. Si el mástil sigue sin subir, retira el montacargas de servicio y avisa.',
          },
        ],
      },
    ],
  },
  {
    id: 'coldroom',
    label: 'Cámara frigorífica',
    icon: '❄️',
    sector: 'Alimentos',
    faults: [
      {
        id: 'coldroom-temp',
        title: 'TEMPERATURA FUERA DE RANGO',
        metric: 'Temperatura',
        unit: ' °C',
        range: [6, 12],
        severity: 'high',
        keywords: ['temperatura', 'no enfría', 'no enfria', 'caliente', 'tibia', 'descongela'],
        steps: [
          {
            title: 'Cierra bien la puerta',
            voice: 'Paso uno. Verifica que la puerta esté bien cerrada y el sello en buen estado.',
          },
          {
            title: 'Revisa el evaporador',
            voice: 'Paso dos. Revisa si el evaporador tiene hielo acumulado.',
          },
          {
            title: 'Protege el producto',
            voice:
              'Paso tres. Si la temperatura sigue arriba de cinco grados, avisa a tu supervisor para mover el producto.',
          },
        ],
      },
      {
        id: 'coldroom-door',
        title: 'PUERTA ABIERTA',
        metric: 'Tiempo abierta',
        unit: ' min',
        range: [5, 15],
        severity: 'medium',
        keywords: ['puerta', 'abierta', 'cierra', 'sello', 'alarma'],
        steps: [
          { title: 'Cierra la puerta', voice: 'Paso uno. Cierra la puerta de la cámara.' },
          {
            title: 'Revisa el seguro y el sello',
            voice: 'Paso dos. Revisa el seguro y el sello de la puerta.',
          },
          {
            title: 'Verifica la temperatura',
            voice: 'Paso tres. Espera unos minutos y verifica que la temperatura regrese al rango.',
          },
        ],
      },
    ],
  },
  {
    id: 'oven',
    label: 'Horno industrial',
    icon: '🍞',
    sector: 'Alimentos',
    faults: [
      {
        id: 'oven-temp',
        title: 'NO LLEGA A TEMPERATURA',
        metric: 'Temperatura',
        unit: ' °C',
        range: [120, 160],
        severity: 'medium',
        keywords: [
          'no calienta',
          'temperatura',
          'tarda',
          'resistencia',
          'quemador',
          'frío',
          'frio',
        ],
        steps: [
          {
            title: 'Verifica el termostato',
            voice: 'Paso uno. Verifica que el termostato esté en la temperatura correcta.',
          },
          {
            title: 'Revisa quemador o resistencia',
            voice: 'Paso dos. Revisa si el quemador o la resistencia se enciende.',
          },
          {
            title: 'Avisa a mantenimiento',
            voice: 'Paso tres. Si no enciende, no fuerces el equipo y avisa a mantenimiento.',
          },
        ],
      },
      {
        id: 'oven-smoke',
        title: 'HUMO EN EL HORNO',
        metric: 'Humo',
        unit: ' ppm',
        range: [180, 320],
        severity: 'critical',
        keywords: ['humo', 'quemado', 'fuego', 'llama', 'huele'],
        steps: [
          {
            title: 'Apaga el horno',
            voice: 'Paso uno. Apaga el horno y corta el gas o la electricidad.',
          },
          {
            title: 'No abras de golpe',
            voice: 'Paso dos. No abras la puerta de golpe. Aléjate del humo y ventila el área.',
          },
          {
            title: 'Activa el protocolo',
            voice:
              'Paso tres. Si hay llamas, usa el extintor adecuado y activa el protocolo de emergencia.',
          },
        ],
      },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitor de signos vitales',
    icon: '🩺',
    sector: 'Salud',
    faults: [
      {
        id: 'monitor-lead',
        title: 'ELECTRODO DESCONECTADO',
        metric: 'Señal',
        unit: ' %',
        range: [0, 12],
        severity: 'medium',
        keywords: ['electrodo', 'señal', 'senal', 'cable', 'desconect', 'sin lectura'],
        steps: [
          {
            title: 'Revisa al paciente primero',
            voice: 'Paso uno. Revisa primero al paciente para confirmar que está estable.',
          },
          {
            title: 'Reconecta el electrodo',
            voice: 'Paso dos. Reconecta el electrodo y verifica el contacto con la piel.',
          },
          {
            title: 'Confirma la señal',
            voice: 'Paso tres. Confirma que la señal en el monitor sea estable.',
          },
        ],
      },
      {
        id: 'monitor-battery',
        title: 'BATERÍA BAJA',
        metric: 'Carga',
        unit: ' %',
        range: [4, 12],
        severity: 'medium',
        keywords: ['batería', 'bateria', 'carga', 'apaga', 'enchufe'],
        steps: [
          {
            title: 'Conecta a la corriente',
            voice: 'Paso uno. Conecta el monitor a la corriente eléctrica.',
          },
          {
            title: 'Verifica el indicador',
            voice: 'Paso dos. Verifica que el indicador de carga esté encendido.',
          },
          {
            title: 'Reporta si no carga',
            voice: 'Paso tres. Si no carga, reporta el equipo a ingeniería biomédica.',
          },
        ],
      },
    ],
  },
];

// Plan genérico para cuando no se reconoce la falla (modo sin conexión).
export const GENERIC_STEPS = [
  {
    title: 'Detén el equipo con seguridad',
    voice: 'Paso uno. Detén el equipo siguiendo el procedimiento seguro y bloquea la energía.',
  },
  {
    title: 'Observa y anota el síntoma',
    voice: 'Paso dos. Observa qué ocurre y anota ruidos, olores, temperatura o fugas.',
  },
  {
    title: 'Avisa a tu supervisor',
    voice: 'Paso tres. Avisa a tu supervisor o a mantenimiento antes de volver a operar.',
  },
];

export const DEFAULT_MACHINE_TYPE_ID = 'boiler';

export function getMachineType(id) {
  return MACHINE_TYPES.find((t) => t.id === id) ?? MACHINE_TYPES[0];
}

export function getFault(machineTypeId, faultId) {
  return getMachineType(machineTypeId).faults.find((f) => f.id === faultId) ?? null;
}
