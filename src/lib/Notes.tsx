export type Note = {
  name: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  solfege: 'Do' | 'Re' | 'Mi' | 'Fa' | 'Sol' | 'La' | 'Si';
  octave: number;
  position: number; // 0 is bottom line (E4), 8 is top line (F5)
};

const solfegeMap = {
  'A': 'La',
  'B': 'Si',
  'C': 'Do',
  'D': 'Re',
  'E': 'Mi',
  'F': 'Fa',
  'G': 'Sol',
} as const;


// Notes on the treble clef staff
export const notes: Note[] = [
  { name: 'E', solfege: 'Mi', octave: 4, position: 0 }, // Line 1
  { name: 'F', solfege: 'Fa', octave: 4, position: 1 }, // Space 1
  { name: 'G', solfege: 'Sol', octave: 4, position: 2 }, // Line 2
  { name: 'A', solfege: 'La', octave: 4, position: 3 }, // Space 2
  { name: 'B', solfege: 'Si', octave: 4, position: 4 }, // Line 3
  { name: 'C', solfege: 'Do', octave: 5, position: 5 }, // Space 3
  { name: 'D', solfege: 'Re', octave: 5, position: 6 }, // Line 4
  { name: 'E', solfege: 'Mi', octave: 5, position: 7 }, // Space 4
  { name: 'F', solfege: 'Fa', octave: 5, position: 8 }, // Line 5
];

export const noteNames = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;

export type Question = {
  correctNote: Note;
  options: string[];
};

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function getQuestion(): Question {

  const correctNote = notes[Math.floor(Math.random() * notes.length)];

  const incorrectOptions: string[] = [];
  while (incorrectOptions.length < 3) {
    const randomNoteName = noteNames[Math.floor(Math.random() * noteNames.length)];
    if (randomNoteName !== correctNote.solfege && !incorrectOptions.includes(randomNoteName)) {
      incorrectOptions.push(randomNoteName);
    }
  }
  const options = shuffleArray([correctNote.solfege, ...incorrectOptions]);

  return {
    correctNote,
    options,
  };
}
