// app/_data/workouts.js
// Registro central dos treinos (base para /admin)
//
// Chaves: a, b, c, d, e (ids usados em /treino/[id])
// Campos:
//  - title: título exibido no header e nos cards
//  - duration: subtítulo (tempo estimado) exibido no header e nos cards
//  - desc: descrição breve exibida nos cards

export const WORKOUTS = {
  a: {
    title: 'Treino A — Braço',
    duration: '~ 55–65 min',
    desc: 'Bíceps e tríceps com foco em progressão de carga.',
  },
  b: {
    title: 'Treino B — Costas',
    duration: '~ 50–60 min',
    desc: 'Dorsais e lombar com ênfase em remadas e puxadas.',
  },
  c: {
    title: 'Treino C — Pernas',
    duration: '~ 60–70 min',
    desc: 'Quadríceps, posteriores e glúteos; bases e acessórios.',
  },
  d: {
    title: 'Treino D — Ombros',
    duration: '~ 45–55 min',
    desc: 'Deltoides e trapézio; estabilidade e hipertrofia.',
  },
  e: {
    title: 'Treino E — Peito',
    duration: '~ 50–60 min',
    desc: 'Peitoral com variações de ângulo e tempo sob tensão.',
  },
};

// Helper opcional (pode ignorar se não for usar)
export function isValidWorkoutId(id) {
  return Boolean(id && WORKOUTS[id]);
}