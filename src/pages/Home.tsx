import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { connect, useSelector } from 'react-redux';
import Background from '../components/Background';
import Box from '../components/Box';
import { GameStatus } from '../constants/GameStatus';
import { Constant } from '../constants/Constant';
import { setGameStatus, setPoint, setStreak, setResetGame } from '../states/actions/gameAction';
import { StateType } from '../states/reducers';
import { getQuestion, notes, playFrequency, playNoteSound, playEffect, Question, fadeBackgroundMusic, controlBackgroundMusic } from '../lib/Note';
import { Award, CheckCircle, Clock, Flame, LogOut, ShieldX, Star, Volume2 } from 'lucide-react';
import Flex, { FlexType } from '../components/Flex';
import { Button, Card, CardBody, CardFooter, CardHeader, Progress, Select, SelectItem, Slider, Switch, Chip } from '@heroui/react';
import { NoteStaff } from '../components/NoteStaff';
import { cn } from '../lib/Util';
import { CardContent, CardDescription, CardTitle } from '../components/Card';
import { ConnectedProps } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Home: FC<PropsFromRedux> = (props): JSX.Element => {
    const [gameDuration, setGameDuration] = useState(Constant.GAME_DURATION_MIN);
    const [timeLeft, setTimeLeft] = useState(Constant.GAME_DURATION_MIN);
    const [tempSettings, setTempSettings] = useState({ musicVolume: 0.5, duration: Constant.GAME_DURATION_MIN, soundEffectsEnabled: true, noteSoundType: 'piano' as 'piano' | 'oscillator', oscillatorType: 'sine' as OscillatorType, answerDisplayMode: 'solfege' as 'solfege' | 'name', selectedOctaves: new Set(['3', '4', '5']), showOctaveBadge: true });
    const [question, setQuestion] = useState<Question>(getQuestion());
    const [selection, setSelection] = useState<{ answer: string; isCorrect: boolean } | null>(null);
    const [testValue, setTestValue] = useState('');
    const [musicVolume, setMusicVolume] = useState(0.5);
    const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
    const [noteSoundType, setNoteSoundType] = useState<'piano' | 'oscillator'>('piano');
    const [oscillatorType, setOscillatorType] = useState<OscillatorType>('sine');
    const [answerDisplayMode, setAnswerDisplayMode] = useState<'solfege' | 'name'>('solfege');
    const [selectedOctaves, setSelectedOctaves] = useState<Set<string>>(new Set(['3', '4', '5']));
    const [showOctaveBadge, setShowOctaveBadge] = useState(true);
    const [feedback, setFeedback] = useState<string | null>(null);
    const game = useSelector((state: StateType) => state.game);
    const content = useSelector((state: StateType) => state.content);
    const progress = useMemo(() => (timeLeft / gameDuration) * 100, [timeLeft, gameDuration]);
    
    const timerColor = useMemo(() => {
        if (timeLeft <= 10) return 'danger';
        if (timeLeft <= 30) return 'warning';
        return 'secondary';
    }, [timeLeft]);

    const octaveColor = useMemo(() => {
        const oct = question.correctNote.octave;
        if (oct <= 3) return 'danger';    // Bas sesler (0, 1, 2, 3) - Kırmızı
        if (oct === 4) return 'success';  // Orta sesler (4) - Yeşil
        if (oct <= 6) return 'primary';   // Tiz sesler (5, 6) - Mavi
        return 'secondary';               // Çok tiz (7) - Mor
    }, [question.correctNote.octave]);

    const loadNextQuestion = useCallback((exclude1?: string | null, exclude2?: string | null) => {
        setQuestion(getQuestion(exclude1, exclude2, selectedOctaves));
        setSelection(null);
    }, [selectedOctaves]);

    useEffect(() => {
        loadNextQuestion();
    }, [loadNextQuestion]);

    useEffect(() => {
        const savedVolume = localStorage.getItem('settings_volume');
        const savedDuration = localStorage.getItem('settings_duration');
        const savedSFX = localStorage.getItem('settings_sfx');
        const savedNoteSoundType = localStorage.getItem('settings_note_sound_type');
        const savedOsc = localStorage.getItem('settings_oscillator');
        const savedDisplayMode = localStorage.getItem('settings_display_mode');
        const savedOctaves = localStorage.getItem('settings_octaves');
        const savedShowOctave = localStorage.getItem('settings_show_octave');

        if (savedVolume !== null) {
            const v = parseFloat(savedVolume);
            setMusicVolume(v);
            controlBackgroundMusic('start', musicVolume);
            fadeBackgroundMusic(v, 0); // Kayıtlı sesi anında uygula
        }
        if (savedDuration !== null) {
            const d = parseInt(savedDuration);
            setGameDuration(d);
            setTimeLeft(d);
        }
        if (savedSFX !== null) {
            setSoundEffectsEnabled(savedSFX === 'true');
        }
        if (savedNoteSoundType !== null) {
            setNoteSoundType(savedNoteSoundType as 'piano' | 'oscillator');
        }
        if (savedOsc !== null) {
            setOscillatorType(savedOsc as OscillatorType);
        }
        if (savedDisplayMode !== null) {
            setAnswerDisplayMode(savedDisplayMode as 'solfege' | 'name');
        }
        if (savedOctaves !== null) {
            try {
                const parsed = JSON.parse(savedOctaves);
                if (Array.isArray(parsed)) setSelectedOctaves(new Set(parsed));
            } catch (e) {
                console.error("Error parsing saved octaves", e);
            }
        }
        if (savedShowOctave !== null) {
            setShowOctaveBadge(savedShowOctave === 'true');
        }
    }, [content]);

    useEffect(() => {
        // Sadece oyun veya alıştırma modundayken yeni bir soru geldiğinde notayı çal
        if (question && (game.gameStatus === GameStatus.PLAYING || game.gameStatus === GameStatus.EXERCISING)) {
            playNoteSound(question.correctNote, 1, noteSoundType, oscillatorType); //TODO Ana menü müzik sesiyle karışmaması için ayrı bir müzik/sfx ses seviyesi eklenebilir
        }
    }, [question, game.gameStatus, noteSoundType, oscillatorType]);

    useEffect(() => {
        const statusCurrent = game.gameStatus;

        if (game.gameStatus != GameStatus.PLAYING)
            return;
        if (timeLeft <= 0) {
            endGameAction();
            return;
        }

        const timerId = setInterval(() => {
            if (statusCurrent == GameStatus.PLAYING)
                setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, game.gameStatus]);

    useEffect(() => {
        gameBegin();
    }, [game.gameStatus]);

    const handleAnswer = (answer: string) => {
        if (selection || !question) return;

        const isCorrect = answer === question.correctNote.solfege;
        let point = Constant.DEFAULT_POINT;
        let type = Constant.DEFAULT_POINT;

        if (isCorrect) {
            // Doğru cevap ses dosyası
            if (soundEffectsEnabled) playEffect('correct');

            const newStreak = game.streak + 1;
            props.setStreak(newStreak);

            // Seri 3, 5, 10 ve katlarına ulaştığında tebrik mesajı göster
            if (newStreak === 3 || newStreak % 5 === 0) {
                const messages = [Constant.CONFETTI_CELEBRATION_1, Constant.CONFETTI_CELEBRATION_2, Constant.CONFETTI_CELEBRATION_3, Constant.CONFETTI_CELEBRATION_4, Constant.CONFETTI_CELEBRATION_5];
                setFeedback(messages[Math.floor(Math.random() * messages.length)]);

                // Konfeti Efekti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7'],
                    disableForReducedMotion: true
                });

                setTimeout(() => setFeedback(null), 1000);
            }

            // Puanı streak ile çarpıyoruz (Örn: 5, 10, 15...)
            point = (Constant.GAINED_POINT * 5) * newStreak;
            type = Constant.GAINED_POINT;
        } else {
            // Yanlış cevap ses dosyası
            if (soundEffectsEnabled) playEffect('incorrect');
            
            props.setStreak(Constant.DEFAULT_POINT);
        }

        setSelection({ answer, isCorrect });
        props.setPoint({ point: point, type: type });

        setTimeout(() => {
            loadNextQuestion(question.correctNote.solfege, answer);
        }, 1200);
    };

    const fadeOutMusic = useCallback(() => {
        // Tone.js ile 1 saniye içinde pürüzsüzce sesi kapat
        fadeBackgroundMusic(0, 1);
    }, []);

    const endGameAction = () => {
        props.setGameStatus(GameStatus.END);
    };

    const startGameAction = () => {
        loadNextQuestion();
        props.setResetGame();
        props.setGameStatus(GameStatus.PLAYING);
        setTimeLeft(gameDuration);
        fadeOutMusic();
    }

    const startExerciseModeAction = () => {
        loadNextQuestion();
        props.setResetGame();
        props.setGameStatus(GameStatus.EXERCISING);
        fadeOutMusic();
    }

    const exitGameAction = () => {
        props.setResetGame();
        props.setGameStatus(GameStatus.START);
        setTimeLeft(gameDuration);
        fadeBackgroundMusic(musicVolume, 1); // 1 saniyede geri aç
        controlBackgroundMusic('start', musicVolume);
    }

    const playAgainAction = () => {
        startGameAction();
    }

    const settingsAction = () => {
        setTempSettings({ musicVolume, duration: gameDuration, soundEffectsEnabled, noteSoundType, oscillatorType, answerDisplayMode, selectedOctaves: new Set(selectedOctaves), showOctaveBadge });
        props.setGameStatus(GameStatus.SETTINGS);
    }

    const saveSettings = () => {
        localStorage.setItem('settings_volume', musicVolume.toString());
        localStorage.setItem('settings_duration', gameDuration.toString());
        localStorage.setItem('settings_sfx', soundEffectsEnabled.toString());
        localStorage.setItem('settings_note_sound_type', noteSoundType);
        localStorage.setItem('settings_oscillator', oscillatorType);
        localStorage.setItem('settings_display_mode', answerDisplayMode);
        localStorage.setItem('settings_octaves', JSON.stringify(Array.from(selectedOctaves)));
        localStorage.setItem('settings_show_octave', showOctaveBadge.toString());
        props.setGameStatus(GameStatus.START);
    }

    const cancelSettings = () => {
        setMusicVolume(tempSettings.musicVolume);
        setGameDuration(tempSettings.duration);
        setSoundEffectsEnabled(tempSettings.soundEffectsEnabled);
        setNoteSoundType(tempSettings.noteSoundType);
        setOscillatorType(tempSettings.oscillatorType);
        setAnswerDisplayMode(tempSettings.answerDisplayMode);
        setSelectedOctaves(tempSettings.selectedOctaves);
        setShowOctaveBadge(tempSettings.showOctaveBadge);
        fadeBackgroundMusic(tempSettings.musicVolume, 0);
        props.setGameStatus(GameStatus.START);
    }


    const handleVolumeChange = (value: number | number[]) => {
        const val = Array.isArray(value) ? value[0] : value;
        setMusicVolume(val);
        fadeBackgroundMusic(val, 0.1); // Slider değişimlerinde pürüzsüz küçük geçiş
    }

    const testSounds = () => {
        if (soundEffectsEnabled) {
            playEffect('correct');
            setTimeout(() => playEffect('incorrect'), 400);
        }
    }

    const highScoresAction = () => {

    }

    const handleTestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setTestValue(val);
        // notes dizisinden girilen fullName ile eşleşen notayı buluyoruz
        const foundNote = notes.find(n => n.fullName === val);
        if (foundNote) {
            setQuestion(prev => ({
                ...prev,
                correctNote: foundNote,
                play: () => playFrequency(foundNote.frequency)
            }));
        }
    };

    const triggerTestFeedback = () => {
        const messages = [Constant.CONFETTI_CELEBRATION_1, Constant.CONFETTI_CELEBRATION_2, Constant.CONFETTI_CELEBRATION_3, Constant.CONFETTI_CELEBRATION_4, Constant.CONFETTI_CELEBRATION_5];
        setFeedback(messages[Math.floor(Math.random() * messages.length)]);

        // Konfeti Efekti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7'],
            disableForReducedMotion: true
        });

        setTimeout(() => setFeedback(null), 1000);
    };

    const gameBegin = (): JSX.Element => {
        if (game.gameStatus == GameStatus.START)
            return readyGame();
        else if (game.gameStatus == GameStatus.PLAYING || game.gameStatus == GameStatus.EXERCISING)
            return startGame();
        else if (game.gameStatus == GameStatus.SETTINGS)
            return settings();
        else
            return endGame();
    }

    const readyGame = (): JSX.Element => {
        return (
            <>
                <Box size={'sm'} mxAuto={true} className='opacity-anim'>
                    <Flex mxAuto={true} align='center' justify='center' className='p-3 flex-col gap-4'>
                        <FlexType flexType='flex-auto' mxAuto={true} className='text-6xl text-white drop-shadow-md antialiased animate-bounce'>{Constant.APP_NAME}</FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onPress={() => {
                            controlBackgroundMusic('start', musicVolume); // İlk kullanıcı etkileşimiyle sesi başlat
                            startGameAction();
                        }} className='text-2xl hover:scale-105 w-40'>{Constant.START_BUTTON}</Button></FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onPress={() => startExerciseModeAction()} className='text-2xl hover:scale-105 w-40'>{Constant.EXERCISE_BUTTON}</Button></FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onPress={() => settingsAction()} className='text-2xl hover:scale-105 w-40'>{Constant.SETTINGS_BUTTON}</Button></FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onPress={() => highScoresAction()} className='text-2xl hover:scale-105 w-40'>{Constant.HIGH_SCORES_BUTTON}</Button></FlexType>
                    </Flex>
                </Box>
            </>
        );
    }

    const startGame = (): JSX.Element => {
        return (
            <div className='relative flex flex-col items-center justify-center min-h-screen w-svw p-4 opacity-anim'>
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1.2, y: 0 }}
                            exit={{ opacity: 0, scale: 1.5, y: -20 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none"
                        >
                            <span className="text-6xl sm:text-8xl font-black text-orange-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] italic tracking-tighter">
                                {feedback}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className='z-10 w-full max-w-2xl mx-auto flex flex-col gap-8'>
                    <header className='flex flex-row justify-between gap-1'>
                        <div className='flex items-center gap-2 p-2 px-4 rounded-full shadow-md bg-white'>
                            <Star className='w-6 h-6 text-yellow-500 fill-yellow-500' />
                            <span className='text-2xl font-bold text-secondary'>{game.point}</span>
                            {game.streak > 1 && (
                                <div className='flex items-center gap-1 ml-2 px-2 py-0.5 bg-orange-100 rounded-full animate-pulse'>
                                    <Flame className='w-5 h-5 text-orange-500 fill-orange-500' />
                                    <span className='text-sm font-bold text-orange-600'>x{game.streak}</span>
                                </div>
                            )}
                        </div>
                        <div className='w-full flex items-center bg-card/80 backdrop-blur-sm px-4 rounded-full shadow-md bg-white'>
                            {game.gameStatus == GameStatus.PLAYING ?
                                <>
                                    <motion.div
                                        animate={timeLeft <= 5 ? { x: [-2, 2, -2, 2, 0] } : { x: 0 }}
                                        transition={{ 
                                            repeat: timeLeft <= 5 ? Infinity : 0, 
                                            duration: 0.4 
                                        }}
                                    >
                                        <Clock className={cn(
                                            'w-6 h-6',
                                            timeLeft <= 10 ? 'text-danger' : timeLeft <= 30 ? 'text-warning' : 'text-secondary'
                                        )} />
                                    </motion.div>
                                    <span className={cn(
                                        'text-2xl font-bold w-12 text-center',
                                        timeLeft <= 10 ? 'text-danger' : timeLeft <= 30 ? 'text-warning' : 'text-secondary'
                                    )}>{timeLeft}s</span>
                                    <Progress value={progress} className='sm:w-105' color={timerColor} />
                                </> : 
                                <Flex mxAuto={true} justify={'between'} className='sm:gap-36 gap-4'>
                                    <div className='flex items-center gap-1'>
                                        <CheckCircle className='w-6 h-6 text-green-500' />
                                        <span className='text-2xl text-green-500'>{game.correct}</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <ShieldX className='w-6 h-6 text-destructive text-red-500' />
                                        <span className='text-2xl text-red-500'>{game.wrong}</span>
                                    </div>
                                </Flex>
                            }
                        </div>
                        <div onClick={() => exitGameAction()} className='flex items-center backdrop-blur-sm px-4 rounded-full shadow-md bg-white hover:scale-115 duration-500 transform cursor-pointer'>
                            <LogOut className='text-secondary'></LogOut>
                        </div>
                    </header>
                    <main>
                        <Card shadow='lg' className='bg-white overflow-hidden relative'>
                            <CardBody>
                                {showOctaveBadge && (
                                    <div className="absolute top-2 right-2 z-20">
                                        <Chip size="sm" variant="flat" color={octaveColor} className="font-bold">
                                            Oktav {question.correctNote.octave}
                                        </Chip>
                                    </div>
                                )}
                                <NoteStaff note={question.correctNote} volume={1} noteSoundType={noteSoundType} oscillatorType={oscillatorType}/>
                            </CardBody>
                        </Card>
                    </main>
                    <footer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {question.options.map((option, index) => {
                            const isSelected = selection?.answer === option;
                            const isCorrect = question.correctNote.solfege === option;
                            
                            // Seçilen moda göre buton metnini ayarla
                            const noteForOption = notes.find(
                                n => n.solfege === option && n.octave === question.correctNote.octave
                            );
                            const displayLabel = answerDisplayMode === 'solfege' ? option : (noteForOption?.fullName || option);

                            return (
                                <Button
                                    key={index}
                                    onPress={() => handleAnswer(option)}
                                    disabled={!!selection}
                                    onMouseOver={() => {
                                        // Seçeneğin solfej ismine ve sorunun oktavına göre ilgili notayı bulup çalıyoruz.
                                        const noteToPlay = notes.find(
                                            n => n.solfege === option && n.octave === question.correctNote.octave
                                        );
                                        if (noteToPlay && GameStatus.LISTENING == game.gameStatus) playNoteSound(noteToPlay, 1, noteSoundType, oscillatorType); //TODO Nota sesleri için ayarlar menüsünden ayrı bir ses seviyesi eklenebilir
                                    }}
                                    className={cn(
                                        "h-20 text-3xl font-bold transition-all duration-300 transform hover:scale-105 text-secondary",
                                        selection && isCorrect && "bg-green-500 hover:bg-green-500 text-white scale-110 border-green-300 border-4",
                                        selection && isSelected && !isCorrect && "bg-red-800 text-white scale-110 border-red-600 border-4",
                                        selection && !isSelected && !isCorrect && "opacity-50"
                                    )}
                                    variant="solid"
                                >
                                    {displayLabel}
                                </Button>
                            );
                        })}
                    </footer>
                </div>
            </div>
        );
    }

    const endGame = (): JSX.Element => {
        return (
            <div className="relative flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden rounded-md  bounceIn">
                <Card className="z-10 p-4 sm:p-8 text-center max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
                    <CardHeader className='flex-col'>
                        <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight">{Constant.GAME_OVER_HEADER}</CardTitle>
                        <CardDescription className="text-base">{Constant.STATS_HEADER}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg">
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <Award className="w-6 h-6 text-amber-500" />
                                <span className="font-medium text-white">{Constant.POINTS}</span>
                            </div>
                            <strong className="font-bold text-2xl text-amber-500">{game.point}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <span className="font-medium text-white">{Constant.CORRECT_ANSWER}</span>
                            </div>
                            <strong className="font-bold text-2xl text-green-500">{game.correct} / {game.total}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <ShieldX className="w-6 h-6 text-destructive text-red-500" />
                                <span className="font-medium text-white">{Constant.WRONG_ANSWER}</span>
                            </div>
                            <strong className="font-bold text-2xl text-red-500">{game.wrong}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <Flame className='w-6 h-6 fill-orange-500 text-orange-500' />
                                <span className="font-medium text-white">{Constant.STREAK}</span>
                            </div>
                            <strong className="font-bold text-2xl text-orange-500">{game.totalStreak}</strong>
                        </div>
                    </CardContent>
                    <CardFooter className='gap-1'>
                        <Button color='secondary' onClick={() => playAgainAction()} className="w-full text-2xl hover:scale-105" size="lg">{Constant.PLAY_AGAIN_BUTTON}</Button>
                        <Button color='secondary' onClick={() => exitGameAction()} className="w-full text-2xl hover:scale-105" size="lg">{Constant.MAIN_MENU_BUTTON}</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const settings = (): JSX.Element => {
        return (<>
        <div className="relative flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden rounded-md  bounceIn">
                <Card className="z-10 p-4 sm:p-8 text-center max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
                    <CardHeader className='flex-col'>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-secondary">{Constant.SETTINGS_HEADER}</h2>
                        <p className="text-base text-default-500">{Constant.SETTINGS_DESC}</p>
                    </CardHeader>
                    <CardBody className="space-y-6 text-lg">
                        <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <Slider 
                            label={Constant.MAIN_MENU_SOUND_LABEL}
                            step={0.01} 
                            maxValue={1} 
                            minValue={0} 
                            value={musicVolume}
                            onChange={handleVolumeChange}
                            startContent={<Volume2 className="text-secondary w-5 h-5" />}
                            color="secondary"
                        />
                        </div>
                        <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <Slider 
                            label={Constant.SETTINGS_GAME_DURATION_LABEL}
                            step={10} 
                            maxValue={Constant.GAME_DURATION_MAX} 
                            minValue={Constant.GAME_DURATION_MIN} 
                            value={gameDuration}
                            onChange={(v) => setGameDuration(Array.isArray(v) ? v[0] : v)}
                            startContent={<Clock className="text-secondary w-5 h-5" />}
                            color="secondary"
                        />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <span className="text-sm font-medium text-foreground">{Constant.SETTINGS_SFX_LABEL}</span>
                            <Switch 
                                isSelected={soundEffectsEnabled} 
                                onValueChange={setSoundEffectsEnabled}
                                color="secondary"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <span className="text-sm font-medium text-foreground">{Constant.SETTINGS_SHOW_OCTAVE_LABEL}</span>
                            <Switch 
                                isSelected={showOctaveBadge} 
                                onValueChange={setShowOctaveBadge}
                                color="secondary"
                            />
                        </div>
                        <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <Select 
                                label={Constant.SETTINGS_NOTE_SOUND_TYPE_LABEL}
                                selectedKeys={[noteSoundType]}
                                onSelectionChange={(keys) => {
                                    const val = Array.from(keys)[0] as string;
                                    if (val) setNoteSoundType(val as 'piano' | 'oscillator');
                                }}
                                color="secondary"
                                variant="flat"
                            >
                                <SelectItem key="piano">{Constant.SETTINGS_NOTE_SOUND_TYPE_PIANO}</SelectItem>
                                <SelectItem key="oscillator">{Constant.SETTINGS_NOTE_SOUND_TYPE_OSCILLATOR}</SelectItem>
                            </Select>
                        </div>
                        {noteSoundType === 'oscillator' && (
                        <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <Select 
                                label={Constant.SETTINGS_OSCILLATOR_LABEL}
                                selectedKeys={[oscillatorType]}
                                onSelectionChange={(keys) => {
                                    const val = Array.from(keys)[0] as string;
                                    if (val) setOscillatorType(val as OscillatorType);
                                }}
                                color="secondary"
                                variant="flat"
                            >
                                <SelectItem key="sine">{Constant.SETTINGS_OSCILLATOR_SINE}</SelectItem>
                                <SelectItem key="square">{Constant.SETTINGS_OSCILLATOR_SQUARE}</SelectItem>
                                <SelectItem key="sawtooth">{Constant.SETTINGS_OSCILLATOR_SAWTOOTH}</SelectItem>
                                <SelectItem key="triangle">{Constant.SETTINGS_OSCILLATOR_TRIANGLE}</SelectItem>
                            </Select>
                        </div>
                        )}
                        <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <Select 
                                label={Constant.SETTINGS_DISPLAY_MODE_LABEL}
                                selectedKeys={[answerDisplayMode]}
                                onSelectionChange={(keys) => {
                                    const val = Array.from(keys)[0] as string;
                                    if (val) setAnswerDisplayMode(val as 'solfege' | 'name');
                                }}
                                color="secondary"
                                variant="flat"
                            >
                                <SelectItem key="solfege">{Constant.SETTINGS_DISPLAY_MODE_SOLFEGE}</SelectItem>
                                <SelectItem key="name">{Constant.SETTINGS_DISPLAY_MODE_SCIENTIFIC}</SelectItem>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg transition-colors duration-300">
                            <Select 
                                label={Constant.SETTINGS_OCTAVES_LABEL}
                                selectionMode="multiple"
                                selectedKeys={selectedOctaves}
                                onSelectionChange={(keys) => setSelectedOctaves(keys as Set<string>)}
                                color="secondary"
                                variant="flat"
                            >
                                {['0', '1', '2', '3', '4', '5', '6', '7'].map((octave) => (
                                    <SelectItem key={octave} textValue={`Octave ${octave}`}>
                                        {Constant.SETTINGS_OCTAVES_LABEL_PREFIX} {octave}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <Button color='primary' variant='flat' onPress={testSounds} className="w-full font-bold">{Constant.TEST_SOUNDS_BUTTON}</Button>
                    </CardBody>
                    <CardFooter className='gap-1'>
                        <Button color='secondary' onPress={() => saveSettings()} className="w-full text-2xl hover:scale-105" size="lg">{Constant.SAVE_BUTTON}</Button>
                        <Button color='secondary' onPress={() => cancelSettings()} className="w-full text-2xl hover:scale-105" size="lg">{Constant.CANCEL_BUTTON}</Button>
                    </CardFooter>
                </Card>
            </div>
        </>);
    }

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{Constant.APP_NAME}</title>
            </Helmet>
            {/* TEST INPUT: Sadece geliştirme sürecinde dizeği kontrol etmek için */}
            <div className="fixed top-4 left-4 z-[100] opacity-80 hover:opacity-100 transition-opacity flex gap-2">
                <input 
                    type="text" 
                    value={testValue} 
                    onChange={handleTestInputChange} 
                    placeholder="Test: C4, A3..."
                    className="w-32 p-2 bg-white/90 text-black border-2 border-secondary rounded-lg shadow-lg font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button 
                    onClick={triggerTestFeedback}
                    className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg font-bold hover:scale-105 active:scale-95 transition-transform"
                >
                    🎉 Test
                </button>
            </div>
            <Background blurBackground = {game.gameStatus == GameStatus.END}>
                {gameBegin()}
            </Background>
        </>
    );
}

const connector = connect(null, {
    setGameStatus,
    setPoint,
    setStreak,
    setResetGame
});

type PropsFromRedux = ConnectedProps<typeof connector>;
const ConnectedHome = connector(Home);

export default ConnectedHome;