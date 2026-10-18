// Pasos de reparación que "recomienda" la IA ante la falla de temperatura alta.
// En la versión final vendrían del backend de IA; aquí son datos de ejemplo.
export const STEPS = [
  {
    id: 1,
    title: 'Cierra la válvula de vapor',
    voice: 'Paso uno. Cierra la válvula de vapor de la máquina cuatro.',
  },
  {
    id: 2,
    title: 'Espera 2 minutos a que enfríe',
    voice: 'Paso dos. Espera dos minutos para que baje la temperatura.',
  },
  {
    id: 3,
    title: 'Revisa el filtro de aire',
    voice: 'Paso tres. Revisa que el filtro de aire no esté obstruido.',
  },
  {
    id: 4,
    title: 'Reinicia y confirma lectura',
    voice: 'Paso cuatro. Reinicia la máquina y confirma que la temperatura sea normal.',
  },
];
