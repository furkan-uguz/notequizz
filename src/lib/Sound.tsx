import * as Tone from 'tone';
import { ContentList } from '../constants/ContentList';
import { Note, notes } from './Note';

/**
 * Tone.js Sampler instance for piano sounds.
 */
let pianoSampler: Tone.Sampler | null = null;
let pianoReverb: Tone.Reverb | null = null;
let effectPlayers: Tone.Players | null = null;
let backgroundPlayer: Tone.Player | null = null;

/**
 * Tone.js Sampler'ı başlatır ve notaları yükler.
 */
export function initSounds(): Promise<void> {
    return new Promise((resolve) => {
        initReverb().then(() => {
            console.log("Reverb initialized.");
            initPiano().then(() => {
                console.log("Piano sounds initialized.");
            });
            resolve();
        });

        initEffectPlayers().then(() => {
            console.log("Effect players initialized.");
            resolve();
        });
    });
}

export function initReverb(): Promise<void> {
    return new Promise((resolve) => {
        // Sesin daha profesyonel ve dolgun duyulması için Reverb efekti ekliyoruz
        pianoReverb = new Tone.Reverb({
            decay: 2.5, // Yankının sönümlenme süresi (saniye)
            wet: 0.1   // Yankı miktarının orijinal sese oranı
        }).toDestination();
        resolve();
    });
}

export function initPiano(): Promise<void> {
    return new Promise((resolve) => {
        const urls: Record<string, string> = {};
        notes.forEach(note => {
            urls[note.fullName] = `octav-${note.octave}/${note.fullName.toLowerCase()}.ogg`;
        });

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
        }).connect(pianoReverb!);
    });
}

export function initEffectPlayers(): Promise<void> {
    return new Promise((resolve) => {
        effectPlayers = new Tone.Players({
            correct: ContentList.CORRECT_ANSWER_SOUND_SRC,
            incorrect: ContentList.WRONG_ANSWER_SOUND_SRC
        }).toDestination();
        resolve();
    });
}

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
    console.log(`Background music command: ${command}, volume: ${volume}`);
    if (!backgroundPlayer) return;
    if (command === 'start') {
        backgroundPlayer.volume.value = Tone.gainToDb(volume);
        if (backgroundPlayer.state !== 'started') {
            backgroundPlayer.start(Tone.now(), 1.4);
        }
    } else {
        backgroundPlayer.stop();
    }
}

export function fadeBackgroundMusic(targetVolume: number, duration: number = 1) {
    if (backgroundPlayer) {
        // 0-1 arası linear gain değerini dB'e çevirip rampTo ile yumuşak geçiş yapıyoruz.
        console.log(`Fading background music to volume: ${targetVolume} over ${duration} seconds.`);
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