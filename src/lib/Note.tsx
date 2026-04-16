import * as Tone from 'tone';
import { ContentList } from '../constants/ContentList';

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
  fullName: 'C0' | 'D0' | 'E0' | 'F0' | 'G0' | 'A0' | 'B0'
   | 'C1' | 'D1' | 'E1' | 'F1' | 'G1' | 'A1' | 'B1'
   | 'C2' | 'D2' | 'E2' | 'F2' | 'G2' | 'A2' | 'B2'
   | 'A3' | 'B3' | 'C3' | 'D3' | 'E3' | 'F3' | 'G3' | 'A4' | 'B4'
   | 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A5' | 'B5' | 'C5' | 'D5' | 'E5'
   | 'F5' | 'G5' | 'A6' | 'B6' | 'C6' | 'D6' | 'E6' | 'F6' | 'G6' | 'A7'
   | 'B7' | 'C7' | 'D7' | 'E7' | 'F7' | 'G7';
};

// Notes on the treble clef staff
export const notes: Note[] = [
  { name: 'C', solfege: 'Do', octave: 0, position: -18, clef: 'bass', frequency: 16.35, fullName: 'C0' },
  { name: 'D', solfege: 'Re', octave: 0, position: -17, clef: 'bass', frequency: 18.35, fullName: 'D0' },
  { name: 'E', solfege: 'Mi', octave: 0, position: -16, clef: 'bass', frequency: 20.60, fullName: 'E0' },
  { name: 'F', solfege: 'Fa', octave: 0, position: -15, clef: 'bass', frequency: 21.83, fullName: 'F0' },
  { name: 'G', solfege: 'Sol', octave: 0, position: -14, clef: 'bass', frequency: 24.50, fullName: 'G0' },
  { name: 'A', solfege: 'La', octave: 0, position: -13, clef: 'bass', frequency: 27.50, fullName: 'A0' },
  { name: 'B', solfege: 'Si', octave: 0, position: -12, clef: 'bass', frequency: 30.87, fullName: 'B0' },
  { name: 'C', solfege: 'Do', octave: 1, position: -11, clef: 'bass', frequency: 32.70, fullName: 'C1' },
  { name: 'D', solfege: 'Re', octave: 1, position: -10, clef: 'bass', frequency: 36.71, fullName: 'D1' },
  { name: 'E', solfege: 'Mi', octave: 1, position: -9, clef: 'bass', frequency: 41.20, fullName: 'E1' },
  { name: 'F', solfege: 'Fa', octave: 1, position: -8, clef: 'bass', frequency: 43.65, fullName: 'F1' },
  { name: 'G', solfege: 'Sol', octave: 1, position: -7, clef: 'bass', frequency: 49.00, fullName: 'G1' },
  { name: 'A', solfege: 'La', octave: 1, position: -6, clef: 'bass', frequency: 55.00, fullName: 'A1' },
  { name: 'B', solfege: 'Si', octave: 1, position: -5, clef: 'bass', frequency: 61.74, fullName: 'B1' },
  { name: 'C', solfege: 'Do', octave: 2, position: -4, clef: 'bass', frequency: 65.41, fullName: 'C2' },
  { name: 'D', solfege: 'Re', octave: 2, position: -3, clef: 'bass', frequency: 73.42, fullName: 'D2' },
  { name: 'E', solfege: 'Mi', octave: 2, position: -2, clef: 'bass', frequency: 82.41, fullName: 'E2' },
  { name: 'F', solfege: 'Fa', octave: 2, position: -1, clef: 'bass', frequency: 87.31, fullName: 'F2' },
  { name: 'G', solfege: 'Sol', octave: 2, position: 0, clef: 'bass', frequency: 98.00, fullName: 'G2' },
  { name: 'A', solfege: 'La', octave: 2, position: 1, clef: 'bass', frequency: 110.00, fullName: 'A2' },
  { name: 'B', solfege: 'Si', octave: 2, position: 2, clef: 'bass', frequency: 123.47, fullName: 'B2' },
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

/**
 * Tone.js Sampler instance for piano sounds.
 */
let pianoSampler: Tone.Sampler | null = null;
let pianoReverb: Tone.Reverb | null = null;
let effectPlayers: Tone.Players | null = null;
let backgroundPlayer: Tone.Player | null = null;

export function initBackgroundMusic(): Promise<void> {
  return new Promise((resolve) => {
    backgroundPlayer = new Tone.Player({
      url: ContentList.BG_THEME_MUSIC,
      loop: true,
      autostart: false,
      onload: () => resolve(),
    }).toDestination();
  });
}

export function controlBackgroundMusic(command: 'start' | 'stop', volume: number = 0.5) {
  if (!backgroundPlayer) return;
  if (command === 'start') {
    backgroundPlayer.start(Tone.now(), 16); // 16 saniyelik bir başlangıç noktası belirliyoruz
    backgroundPlayer.volume.value = Tone.gainToDb(volume);
    if (backgroundPlayer.state !== 'started') backgroundPlayer.start(Tone.now(), 16);
  } else {
    backgroundPlayer.stop();
  }
}

export function fadeBackgroundMusic(targetVolume: number, duration: number = 1) {
  if (backgroundPlayer) {
    // 0-1 arası linear gain değerini dB'e çevirip rampTo ile yumuşak geçiş yapıyoruz.
    backgroundPlayer.volume.rampTo(Tone.gainToDb(targetVolume), duration);
  }
}

export function playEffect(type: 'correct' | 'incorrect') {
  if (effectPlayers && effectPlayers.loaded) {
    effectPlayers.player(type).start();
  } else {
    console.warn(`Effect player for ${type} is not loaded yet.`);
  }
}

export function playFrequency(frequency: number, type: OscillatorType = 'sine') {
  const synth = new Tone.Oscillator(frequency, type);
  if (pianoReverb) {
    synth.connect(pianoReverb);
  } else {
    synth.toDestination();
  }
  synth.start().stop("+1.2");
}

/**
 * Belirtilen notanın piyano ses dosyasını çalar.
 */
export function playNoteSound(note: Note, volume: number = 1, noteSoundType: 'piano' | 'oscillator' = 'piano', oscillatorType: OscillatorType = 'sine') {
  console.log(`Playing note: ${note.fullName} at frequency ${note.frequency} Hz with volume ${volume}`);
  if (noteSoundType === 'oscillator' || (!pianoSampler || !pianoSampler.loaded)) {
    playFrequency(note.frequency, oscillatorType);
    return;
  }

  // Tone.js uses decibels. Linear 0.5 is approx -6dB.
  pianoSampler.volume.value = Tone.gainToDb(1);
  pianoSampler.triggerAttackRelease(note.fullName, "2n");
}

/**
 * Tone.js Sampler'ı başlatır ve notaları yükler.
 */
export function initSounds(): Promise<void> {
  return new Promise((resolve) => {
    const urls: Record<string, string> = {};
    notes.forEach(note => {
      urls[note.fullName] = `octav-${note.octave}/${note.fullName.toLowerCase()}.ogg`;
    });

    // Efekt seslerini yükle (public/sounds/effects/ altındaki dosyalar)
    effectPlayers = new Tone.Players({
      correct: ContentList.CORRECT_ANSWER_SOUND_SRC, // "sounds/effects/correct.ogg"
      incorrect: ContentList.WRONG_ANSWER_SOUND_SRC // "sounds/effects/incorrect.ogg"
    }).toDestination();

    // Sesin daha profesyonel ve dolgun duyulması için Reverb efekti ekliyoruz
    pianoReverb = new Tone.Reverb({
      decay: 1.5, // Yankının sönümlenme süresi (saniye)
      wet: 0.1   // Yankı miktarının orijinal sese oranı (%25)
    }).toDestination();

    pianoSampler = new Tone.Sampler({
      urls,
      baseUrl: "notes/",
      onload: () => {
        console.log("Piano sampler loaded successfully");
        resolve();
      },
      onerror: (error) => {
        console.error("Error occurred while loading piano sampler:", error);
        resolve(); // Hata durumunda da resolve ediyoruz, böylece oyun devam eder.
      }
    }).connect(pianoReverb);
  });
}

export function getQuestion(excludeSolfege1?: string | null, excludeSolfege2?: string | null, allowedOctaves?: Set<string>): Question {

  let octaveFilteredNotes = notes;
  if (allowedOctaves && allowedOctaves.size > 0) {
    const octavesArr = Array.from(allowedOctaves).map(Number);
    octaveFilteredNotes = notes.filter(n => octavesArr.includes(n.octave));
  }

  // Belirtilen solfej isimlerini (Do, Re vs.) içeren notaları havuzdan çıkarıyoruz.
  const availableNotes = octaveFilteredNotes.filter(n => 
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
      playNoteSound(correctNote);
    }
  };
}
