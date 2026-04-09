import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { connect, useSelector } from 'react-redux';
import Background from '../components/Background';
import Box from '../components/Box';
import Constants, { GameStatus } from '../utils/Const';
import { setGameStatus, setPoint, setStreak, setResetGame } from '../states/actions/gameActions';
import { StateType } from '../states/reducers';
import { getQuestion, notes, playFrequency, Question } from '../lib/Notes';
import { Award, CheckCircle, Clock, Flame, LogOut, ShieldX, Star } from 'lucide-react';
import Flex, { FlexType } from '../components/Flex';
import { Button, Card, CardBody, CardFooter, CardHeader, Progress } from '@heroui/react';
import { NoteStaff } from '../components/NoteStaff';
import { cn } from '../lib/utils';
import { CardContent, CardDescription, CardTitle } from '../components/Card';
import { ConnectedProps } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Home: FC<PropsFromRedux> = (props): JSX.Element => {
    const [timeLeft, setTimeLeft] = useState(Constants.GAME_DURATION_MIN); //TODO İleride ayarlar kısmından süresi max min ayarlanacak.
    const [question, setQuestion] = useState<Question>(getQuestion());
    const [selection, setSelection] = useState<{ answer: string; isCorrect: boolean } | null>(null);
    const [testValue, setTestValue] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const game = useSelector((state: StateType) => state.game);
    const content = useSelector((state: StateType) => state.content);
    const progress = useMemo(() => (timeLeft / Constants.GAME_DURATION_MIN) * 100, [timeLeft]);
    
    const timerColor = useMemo(() => {
        if (timeLeft <= 10) return 'danger';
        if (timeLeft <= 30) return 'warning';
        return 'secondary';
    }, [timeLeft]);

    const loadNextQuestion = useCallback((exclude1?: string | null, exclude2?: string | null) => {
        setQuestion(getQuestion(exclude1, exclude2));
        setSelection(null);
    }, []);

    useEffect(() => {
        loadNextQuestion();
    }, [loadNextQuestion]);

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
        let point = Constants.DEFAULT_POINT;
        let type = Constants.DEFAULT_POINT;

        if (isCorrect) {
            const newStreak = game.streak + 1;
            props.setStreak(newStreak);

            // Seri 3, 5, 10 ve katlarına ulaştığında tebrik mesajı göster
            if (newStreak === 3 || newStreak % 5 === 0) {
                const messages = ["Harika!", "Mükemmel!", "Süper!", "Muhteşem!", "Durdurulamaz!", "Efsanevi!"]; //TODO Bu mesajlar sabite eklenmeli
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
            point = (Constants.GAINED_POINT * 5) * newStreak;
            type = Constants.GAINED_POINT;
        } else {
            props.setStreak(Constants.DEFAULT_POINT);
        }

        setSelection({ answer, isCorrect });
        props.setPoint({ point: point, type: type });

        setTimeout(() => {
            loadNextQuestion(question.correctNote.solfege, answer);
        }, 1200);
    };

    const endGameAction = () => {
        props.setGameStatus(GameStatus.END);
    };

    const startGameAction = () => {
        loadNextQuestion();
        props.setResetGame();
        props.setGameStatus(GameStatus.PLAYING);
        setTimeLeft(Constants.GAME_DURATION_MIN);
        content.backgroundMusic?.pause();
    }

    const startExerciseModeAction = () => {
        loadNextQuestion();
        props.setResetGame();
        props.setGameStatus(GameStatus.EXERCISING);
        content.backgroundMusic?.pause();
    }

    const exitGameAction = () => {
        props.setResetGame();
        props.setGameStatus(GameStatus.START);
        setTimeLeft(Constants.GAME_DURATION_MIN);
        content.backgroundMusic?.play();
    }

    const playAgainAction = () => {
        startGameAction();
    }

    const settingsAction = () => {
        
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
        const messages = ["Harika!", "Mükemmel!", "Süper!", "Muhteşem!", "Durdurulamaz!", "Efsanevi!"];
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
        else
            return endGame();
    }

    const readyGame = (): JSX.Element => {
        return (
            <>
                <Box size={'sm'} mxAuto={true} className='opacity-anim'>
                    <Flex mxAuto={true} align='center' justify='center' className='p-3 flex-col gap-4'>
                        <FlexType flexType='flex-auto' mxAuto={true} className='text-6xl text-white drop-shadow-md antialiased animate-bounce'>{Constants.APP_NAME}</FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onClick={() => startGameAction()} className='text-2xl hover:scale-105 w-40'>{Constants.START_BUTTON}</Button></FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onClick={() => startExerciseModeAction()} className='text-2xl hover:scale-105 w-40'>{Constants.EXERCISE_BUTTON}</Button></FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onClick={() => settingsAction()} className='text-2xl hover:scale-105 w-40'>{Constants.SETTINGS_BUTTON}</Button></FlexType>
                        <FlexType flexType='flex-auto' className='antialiased opacity-anim'><Button color='secondary' onClick={() => highScoresAction()} className='text-2xl hover:scale-105 w-40'>{Constants.HIGH_SCORES_BUTTON}</Button></FlexType>
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
                            <span className="text-6xl sm:text-8xl font-black text-orange-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] italic uppercase tracking-tighter">
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
                        <Card shadow='lg' className='bg-white overflow-hidden'>
                            <CardBody>
                                <NoteStaff note={question.correctNote} />
                            </CardBody>
                        </Card>
                    </main>
                    <footer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {question.options.map((option, index) => {
                            const isSelected = selection?.answer === option;
                            const isCorrect = question.correctNote.solfege === option;

                            return (
                                <Button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!selection}
                                    onMouseOver={() => {
                                        // Seçeneğin solfej ismine ve sorunun oktavına göre ilgili notayı bulup çalıyoruz.
                                        const noteToPlay = notes.find(
                                            n => n.solfege === option && n.octave === question.correctNote.octave
                                        );
                                        if (noteToPlay && GameStatus.LISTENING == game.gameStatus) playFrequency(noteToPlay.frequency);
                                    }}
                                    className={cn(
                                        "h-20 text-3xl font-bold transition-all duration-300 transform hover:scale-105 text-secondary",
                                        selection && isCorrect && "bg-green-500 hover:bg-green-500 text-white scale-110 border-green-300 border-4",
                                        selection && isSelected && !isCorrect && "bg-red-800 text-white scale-110 border-red-600 border-4",
                                        selection && !isSelected && !isCorrect && "opacity-50"
                                    )}
                                    variant="solid"
                                >
                                    {option}
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
                        <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight">{Constants.GAME_OVER_HEADER}</CardTitle>
                        <CardDescription className="text-base">{Constants.STATS_HEADER}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg">
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <Award className="w-6 h-6 text-amber-500" />
                                <span className="font-medium text-white">{Constants.POINTS}</span>
                            </div>
                            <strong className="font-bold text-2xl text-amber-500">{game.point}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <span className="font-medium text-white">{Constants.CORRECT_ANSWER}</span>
                            </div>
                            <strong className="font-bold text-2xl text-green-500">{game.correct} / {game.total}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <ShieldX className="w-6 h-6 text-destructive text-red-500" />
                                <span className="font-medium text-white">{Constants.WRONG_ANSWER}</span>
                            </div>
                            <strong className="font-bold text-2xl text-red-500">{game.wrong}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <Flame className='w-6 h-6 fill-orange-500 text-orange-500' />
                                <span className="font-medium text-white">{Constants.STREAK}</span>
                            </div>
                            <strong className="font-bold text-2xl text-orange-500">{game.totalStreak}</strong>
                        </div>
                    </CardContent>
                    <CardFooter className='gap-1'>
                        <Button color='secondary' onClick={() => playAgainAction()} className="w-full text-2xl hover:scale-105" size="lg">{Constants.PLAY_AGAIN_BUTTON}</Button>
                        <Button color='secondary' onClick={() => exitGameAction()} className="w-full text-2xl hover:scale-105" size="lg">{Constants.MAIN_MENU_BUTTON}</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{Constants.APP_NAME}</title>
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