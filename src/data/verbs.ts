// French Irregular Verbs Data Structure
// Each verb includes conjugations for: Présent, Passé Composé, Imparfait, Futur Simple

export interface Conjugation {
  je: string;
  tu: string;
  il: string;      // il/elle/on
  nous: string;
  vous: string;
  ils: string;     // ils/elles
}

export interface PasseCompose {
  auxiliary: 'avoir' | 'être';
  pastParticiple: string;
  je: string;
  tu: string;
  il: string;
  nous: string;
  vous: string;
  ils: string;
}

export interface Verb {
  id: string;
  infinitive: string;
  english: string;
  present: Conjugation;
  passeCompose: PasseCompose;
  imparfait: Conjugation;
  futurSimple: Conjugation;
}

export const verbs: Verb[] = [
  {
    id: 'etre',
    infinitive: 'être',
    english: 'to be',
    present: {
      je: 'suis',
      tu: 'es',
      il: 'est',
      nous: 'sommes',
      vous: 'êtes',
      ils: 'sont',
    },
    passeCompose: {
      auxiliary: 'avoir',
      pastParticiple: 'été',
      je: 'ai été',
      tu: 'as été',
      il: 'a été',
      nous: 'avons été',
      vous: 'avez été',
      ils: 'ont été',
    },
    imparfait: {
      je: 'étais',
      tu: 'étais',
      il: 'était',
      nous: 'étions',
      vous: 'étiez',
      ils: 'étaient',
    },
    futurSimple: {
      je: 'serai',
      tu: 'seras',
      il: 'sera',
      nous: 'serons',
      vous: 'serez',
      ils: 'seront',
    },
  },
  {
    id: 'avoir',
    infinitive: 'avoir',
    english: 'to have',
    present: {
      je: 'ai',
      tu: 'as',
      il: 'a',
      nous: 'avons',
      vous: 'avez',
      ils: 'ont',
    },
    passeCompose: {
      auxiliary: 'avoir',
      pastParticiple: 'eu',
      je: 'ai eu',
      tu: 'as eu',
      il: 'a eu',
      nous: 'avons eu',
      vous: 'avez eu',
      ils: 'ont eu',
    },
    imparfait: {
      je: 'avais',
      tu: 'avais',
      il: 'avait',
      nous: 'avions',
      vous: 'aviez',
      ils: 'avaient',
    },
    futurSimple: {
      je: 'aurai',
      tu: 'auras',
      il: 'aura',
      nous: 'aurons',
      vous: 'aurez',
      ils: 'auront',
    },
  },
  {
    id: 'aller',
    infinitive: 'aller',
    english: 'to go',
    present: {
      je: 'vais',
      tu: 'vas',
      il: 'va',
      nous: 'allons',
      vous: 'allez',
      ils: 'vont',
    },
    passeCompose: {
      auxiliary: 'être',
      pastParticiple: 'allé',
      je: 'suis allé',
      tu: 'es allé',
      il: 'est allé',
      nous: 'sommes allés',
      vous: 'êtes allé',
      ils: 'sont allés',
    },
    imparfait: {
      je: 'allais',
      tu: 'allais',
      il: 'allait',
      nous: 'allions',
      vous: 'alliez',
      ils: 'allaient',
    },
    futurSimple: {
      je: 'irai',
      tu: 'iras',
      il: 'ira',
      nous: 'irons',
      vous: 'irez',
      ils: 'iront',
    },
  },
  {
    id: 'faire',
    infinitive: 'faire',
    english: 'to do / to make',
    present: {
      je: 'fais',
      tu: 'fais',
      il: 'fait',
      nous: 'faisons',
      vous: 'faites',
      ils: 'font',
    },
    passeCompose: {
      auxiliary: 'avoir',
      pastParticiple: 'fait',
      je: 'ai fait',
      tu: 'as fait',
      il: 'a fait',
      nous: 'avons fait',
      vous: 'avez fait',
      ils: 'ont fait',
    },
    imparfait: {
      je: 'faisais',
      tu: 'faisais',
      il: 'faisait',
      nous: 'faisions',
      vous: 'faisiez',
      ils: 'faisaient',
    },
    futurSimple: {
      je: 'ferai',
      tu: 'feras',
      il: 'fera',
      nous: 'ferons',
      vous: 'ferez',
      ils: 'feront',
    },
  },
  {
    id: 'pouvoir',
    infinitive: 'pouvoir',
    english: 'to be able to / can',
    present: {
      je: 'peux',
      tu: 'peux',
      il: 'peut',
      nous: 'pouvons',
      vous: 'pouvez',
      ils: 'peuvent',
    },
    passeCompose: {
      auxiliary: 'avoir',
      pastParticiple: 'pu',
      je: 'ai pu',
      tu: 'as pu',
      il: 'a pu',
      nous: 'avons pu',
      vous: 'avez pu',
      ils: 'ont pu',
    },
    imparfait: {
      je: 'pouvais',
      tu: 'pouvais',
      il: 'pouvait',
      nous: 'pouvions',
      vous: 'pouviez',
      ils: 'pouvaient',
    },
    futurSimple: {
      je: 'pourrai',
      tu: 'pourras',
      il: 'pourra',
      nous: 'pourrons',
      vous: 'pourrez',
      ils: 'pourront',
    },
  },
];

// Tense display names for UI
export const tenseNames = {
  present: 'Présent',
  passeCompose: 'Passé Composé',
  imparfait: 'Imparfait',
  futurSimple: 'Futur Simple',
} as const;

// Pronouns with display text
export const pronouns = {
  je: 'je',
  tu: 'tu',
  il: 'il/elle',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils/elles',
} as const;

export type TenseKey = keyof typeof tenseNames;
export type PronounKey = keyof typeof pronouns;
