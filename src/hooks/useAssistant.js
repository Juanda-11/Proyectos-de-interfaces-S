import { useCallback, useEffect, useRef, useState } from 'react';
import { requestChat, requestDiagnosis } from '../api/client';
import useSpeaker from './useSpeaker';
import useVoiceInput from './useVoiceInput';

// Lógica del asistente: pide el plan a la IA, lo lee en voz alta paso a paso y atiende preguntas
// por voz o texto. La pantalla (AssistantScreen) solo se encarga de dibujar.
//
// phase: 'idle' (esperando que el trabajador describa el problema)
//        'thinking' (consultando a la IA)
//        'steps' (guiando la reparación paso a paso)
export default function useAssistant({ active, alert, machine, voiceEnabled }) {
  const [phase, setPhase] = useState('idle');
  const [plan, setPlan] = useState(null);
  const [step, setStep] = useState(0);
  const [reply, setReply] = useState(null);
  const [history, setHistory] = useState([]);

  const speaker = useSpeaker({ enabled: voiceEnabled });
  const abortRef = useRef(null);
  const started = useRef(false);
  const latest = useRef({});
  latest.current = { alert, machine, plan, step, history, speaker };

  const begin = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    latest.current.speaker.stop();
    setPhase('thinking');
    return abortRef.current.signal;
  }, []);

  const applyPlan = useCallback((result, intro) => {
    setPlan(result);
    setStep(0);
    setPhase('steps');
    const lead =
      intro ?? (result.severity === 'critical' ? 'Atención, falla crítica.' : result.summary);
    latest.current.speaker.speak(`${lead}. ${result.steps[0].voice}`);
  }, []);

  // Diagnóstico inicial: a partir de la alerta aceptada o de una falla elegida/dictada.
  const diagnose = useCallback(
    async ({ faultAlert, description } = {}) => {
      const signal = begin();
      setReply(null);
      try {
        const result = await requestDiagnosis(
          { machine: latest.current.machine, alert: faultAlert ?? null, description },
          { signal }
        );
        if (!signal.aborted) applyPlan(result);
      } catch (e) {
        if (signal.aborted) return;
        setPhase('idle');
        setReply('No pude analizar la falla. Avisa a tu supervisor.');
      }
    },
    [applyPlan, begin]
  );

  // Pregunta o descripción de un problema (voz o teclado).
  const ask = useCallback(
    async (text) => {
      const message = String(text ?? '').trim();
      if (!message) return;
      const signal = begin();
      const { alert: a, machine: m, plan: p, step: s, history: h } = latest.current;
      try {
        const res = await requestChat(
          { machine: m, alert: a, steps: p?.steps, currentStep: s, message, history: h },
          { signal }
        );
        if (signal.aborted) return;
        setHistory((prev) =>
          [...prev, { role: 'user', text: message }, { role: 'assistant', text: res.reply }].slice(
            -8
          )
        );
        setReply(res.reply);
        if (res.steps?.length) {
          setPlan((old) => ({ ...old, ...res }));
          setStep(0);
          setPhase('steps');
          latest.current.speaker.speak(`${res.reply} ${res.steps[0].voice}`);
        } else {
          setPhase(p ? 'steps' : 'idle');
          latest.current.speaker.speak(res.reply);
        }
      } catch (e) {
        if (signal.aborted) return;
        setPhase(p ? 'steps' : 'idle');
        setReply('No pude responder. Intenta de nuevo.');
      }
    },
    [begin]
  );

  const voice = useVoiceInput({ onFinal: (text) => ask(text) });

  const total = plan?.steps?.length ?? 0;
  const last = total > 0 && step === total - 1;

  const next = useCallback(() => {
    const { plan: p, step: s, speaker: sp } = latest.current;
    if (!p || s >= p.steps.length - 1) return false;
    setReply(null);
    setStep(s + 1);
    sp.speak(p.steps[s + 1].voice);
    return true;
  }, []);

  const replay = useCallback(() => {
    const { plan: p, step: s, speaker: sp } = latest.current;
    if (reply) sp.speak(reply);
    else if (p) sp.speak(p.steps[s].voice);
  }, [reply]);

  const startListening = useCallback(() => {
    latest.current.speaker.stop();
    return voice.start();
  }, [voice]);

  // Al entrar: si hay alerta, diagnostica sola. Al salir: corta voz y reinicia el estado.
  useEffect(() => {
    if (active) {
      if (latest.current.alert && !started.current) {
        started.current = true;
        diagnose({ faultAlert: latest.current.alert });
      }
      return undefined;
    }
    abortRef.current?.abort();
    latest.current.speaker.stop();
    voice.stop();
    const t = setTimeout(() => {
      started.current = false;
      setPlan(null);
      setStep(0);
      setReply(null);
      setHistory([]);
      setPhase('idle');
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return {
    phase,
    plan,
    step,
    total,
    last,
    reply,
    speaking: speaker.speaking,
    voice: { ...voice, start: startListening },
    diagnose,
    ask,
    next,
    replay,
  };
}
