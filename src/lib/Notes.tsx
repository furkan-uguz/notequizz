// Window arayüzünü genişleterek webkitAudioContext özelliğini TypeScript'e tanıtıyoruz.
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export type Note = {
  name: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  solfege: 'Do' | 'Re' | 'Mi' | 'Fa' | 'Sol' | 'La' | 'Si';
  octave: number;
  position: number; // 0 is bottom line (E4), 8 is top line (F5)
  clef: 'treble' | 'bass';
  frequency: number;
  fullName: 'A3' | 'B3' | 'C3' | 'D3' | 'E3' | 'F3' | 'G3' | 'A4' | 'B4'
   | 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A5' | 'B5' | 'C5' | 'D5' | 'E5'
   | 'F5' | 'G5' | 'A6' | 'B6' | 'C6' | 'D6' | 'E6' | 'F6' | 'G6' | 'A7'
   | 'B7' | 'C7' | 'D7' | 'E7' | 'F7' | 'G7';
};

// Notes on the treble clef staff
export const notes: Note[] = [
  { name: 'C', solfege: 'Do', octave: 3, position: 3, clef: 'bass', frequency: 130.81, fullName: 'C3' },
  { name: 'D', solfege: 'Re', octave: 3, position: 4, clef: 'bass', frequency: 146.83, fullName: 'D3' },
  { name: 'E', solfege: 'Mi', octave: 3, position: 5, clef: 'bass', frequency: 164.81, fullName: 'E3' },
  { name: 'F', solfege: 'Fa', octave: 3, position: 6, clef: 'bass', frequency: 174.61, fullName: 'F3' },
  { name: 'G', solfege: 'Sol', octave: 3, position: 7, clef: 'bass', frequency: 196.00, fullName: 'G3' },
  { name: 'A', solfege: 'La', octave: 3, position: 8, clef: 'bass', frequency: 220.00, fullName: 'A3' },
  { name: 'B', solfege: 'Si', octave: 3, position: 9, clef: 'bass', frequency: 246.94, fullName: 'B3' },
  { name: 'C', solfege: 'Do', octave: 4, position: -2, clef: 'treble', frequency: 261.63, fullName: 'C4' },
  { name: 'D', solfege: 'Re', octave: 4, position: -1, clef: 'treble', frequency: 293.66, fullName: 'D4' },
  { name: 'E', solfege: 'Mi', octave: 4, position: 0, clef: 'treble', frequency: 329.63, fullName: 'E4' },
  { name: 'F', solfege: 'Fa', octave: 4, position: 1, clef: 'treble', frequency: 349.23, fullName: 'F4' },
  { name: 'G', solfege: 'Sol', octave: 4, position: 2, clef: 'treble', frequency: 392.00, fullName: 'G4' },
  { name: 'A', solfege: 'La', octave: 4, position: 3, clef: 'treble', frequency: 440.00, fullName: 'A4' },
  { name: 'B', solfege: 'Si', octave: 4, position: 4, clef: 'treble', frequency: 493.88, fullName: 'B4' },
  { name: 'C', solfege: 'Do', octave: 5, position: 5, clef: 'treble', frequency: 523.25, fullName: 'C5' },
  { name: 'D', solfege: 'Re', octave: 5, position: 6, clef: 'treble', frequency: 587.33, fullName: 'D5' },
  { name: 'E', solfege: 'Mi', octave: 5, position: 7, clef: 'treble', frequency: 659.25, fullName: 'E5' },
  { name: 'F', solfege: 'Fa', octave: 5, position: 8, clef: 'treble', frequency: 698.46, fullName: 'F5' },
  { name: 'G', solfege: 'Sol', octave: 5, position: 9, clef: 'treble', frequency: 783.99, fullName: 'G5' },
  { name: 'A', solfege: 'La', octave: 5, position: 10, clef: 'treble', frequency: 880.00, fullName: 'A5' },
  { name: 'B', solfege: 'Si', octave: 5, position: 11, clef: 'treble', frequency: 987.77, fullName: 'B5' },
  { name: 'C', solfege: 'Do', octave: 6, position: 12, clef: 'treble', frequency: 1046.50, fullName: 'C6' },
  { name: 'D', solfege: 'Re', octave: 6, position: 13, clef: 'treble', frequency: 1174.66, fullName: 'D6' },
  { name: 'E', solfege: 'Mi', octave: 6, position: 14, clef: 'treble', frequency: 1318.51, fullName: 'E6' },
  { name: 'F', solfege: 'Fa', octave: 6, position: 15, clef: 'treble', frequency: 1396.91, fullName: 'F6' },
  { name: 'G', solfege: 'Sol', octave: 6, position: 16, clef: 'treble', frequency: 1567.98, fullName: 'G6' },
  { name: 'A', solfege: 'La', octave: 6, position: 17, clef: 'treble', frequency: 1760.00, fullName: 'A6' },
  { name: 'B', solfege: 'Si', octave: 6, position: 18, clef: 'treble', frequency: 1975.53, fullName: 'B6' },
  { name: 'C', solfege: 'Do', octave: 7, position: 19, clef: 'treble', frequency: 2093.00, fullName: 'C7' },
  { name: 'D', solfege: 'Re', octave: 7, position: 20, clef: 'treble', frequency: 2349.32, fullName: 'D7' },
  { name: 'E', solfege: 'Mi', octave: 7, position: 21, clef: 'treble', frequency: 2637.02, fullName: 'E7' },
  { name: 'F', solfege: 'Fa', octave: 7, position: 22, clef: 'treble', frequency: 2793.83, fullName: 'F7' },
  { name: 'G', solfege: 'Sol', octave: 7, position: 23, clef: 'treble', frequency: 3135.96, fullName: 'G7' },
  { name: 'A', solfege: 'La', octave: 7, position: 24, clef: 'treble', frequency: 3520.00, fullName: 'A7' },
  { name: 'B', solfege: 'Si', octave: 7, position: 25, clef: 'treble', frequency: 3951.07, fullName: 'B7' },
];

export const noteNames = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;

export type Question = {
  correctNote: Note;
  options: string[];
  play: () => void;
};

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let audioCtx: AudioContext | null = null;

export function playFrequency(frequency: number) {
  // Artık (window as any) cast işlemine gerek kalmadı.
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  // Her seferinde yeni bir context oluşturmak yerine mevcut olanı kullanıyoruz.
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1.2);
}

export function getQuestion(excludeSolfege1?: string | null, excludeSolfege2?: string | null): Question {

  // Belirtilen solfej isimlerini (Do, Re vs.) içeren notaları havuzdan çıkarıyoruz.
  const availableNotes = notes.filter(n => 
    n.solfege !== excludeSolfege1 && n.solfege !== excludeSolfege2
  );

  const correctNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];

  // Seçilen doğru notanın oktavıyla aynı olan ve doğru nota olmayan diğer notaların isimlerini alıyoruz.
  const wrongSolfegesInSameOctave = notes
    .filter(n => n.octave === correctNote.octave && n.solfege !== correctNote.solfege)
    .map(n => n.solfege);

  const incorrectOptions: string[] = [];
  while (incorrectOptions.length < 3) {
    const randomNoteName = wrongSolfegesInSameOctave[Math.floor(Math.random() * wrongSolfegesInSameOctave.length)];
    if (!incorrectOptions.includes(randomNoteName)) {
      incorrectOptions.push(randomNoteName);
    }
  }
  const options = shuffleArray([correctNote.solfege, ...incorrectOptions]);

  return {
    correctNote,
    options,
    play: () => {
      playFrequency(correctNote.frequency);
    }
  };
}
