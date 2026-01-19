import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { connect, useSelector } from 'react-redux';
import Background from '../components/Background';
import Box from '../components/Box';
import Constants, { GameStatus } from '../utils/Const';
import { setGameStatus, setPoint, setResetGame } from '../states/actions/gameActions';
import { StateType } from '../states/reducers';
import { getQuestion, Question } from '../lib/Notes';
import { Award, CheckCircle, Clock, LogOut, ShieldX, Star } from 'lucide-react';
import Flex, { FlexType } from '../components/Flex';
import { Button, Card, CardBody, CardFooter, CardHeader, Progress } from '@heroui/react';
import { NoteStaff } from '../components/NoteStaff';
import { cn } from '../lib/utils';
import { CardContent, CardDescription, CardTitle } from '../components/Card';

interface IHome {
    setGameStatus: Function;
    setPoint: Function;
    setResetGame: Function;
}

const Home: FC<IHome> = ({ ...props }: IHome): JSX.Element => {
    const [timeLeft, setTimeLeft] = useState(Constants.GAME_DURATION_MIN); //TODO İleride ayarlar kısmından süresi max min ayarlanacak.
    const [question, setQuestion] = useState<Question>(getQuestion());
    const [selection, setSelection] = useState<{ answer: string; isCorrect: boolean } | null>(null);
    const game = useSelector((state: StateType) => state.game);
    const progress = useMemo(() => (timeLeft / Constants.GAME_DURATION_MIN) * 100, [timeLeft]);
    const loadNextQuestion = useCallback(() => {
        setQuestion(getQuestion());
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
        const type = isCorrect ? Constants.GAINED_POINT : Constants.DEFAULT_POINT;
        const point = isCorrect ? Constants.GAINED_POINT * 5 : Constants.DEFAULT_POINT;
        setSelection({ answer, isCorrect });
        props.setPoint({ point: point, type: type });

        setTimeout(() => {
            loadNextQuestion();
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
    }

    const startExerciseModeAction = () => {
        loadNextQuestion();
        props.setResetGame();
        props.setGameStatus(GameStatus.EXERCISING);
    }

    const exitGameAction = () => {
        props.setResetGame();
        props.setGameStatus(GameStatus.START);
        setTimeLeft(Constants.GAME_DURATION_MIN);
    }

    const playAgainAction = () => {
        startGameAction();
    }

    const settingsAction = () => {
        
    }

    const highScoresAction = () => {

    }

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
                <Box size={'sm'} mxAuto={true}>
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
                <div className='z-10 w-full max-w-2xl mx-auto flex flex-col gap-8'>
                    <header className='flex flex-row justify-between gap-1'>
                        <div className='flex items-center gap-2 p-2 px-4 rounded-full shadow-md bg-white'>
                            <Star className='w-6 h-6 text-secondary' />
                            <span className='text-2xl font-bold text-secondary'>{game.point}</span>
                        </div>
                        <div className='w-full flex items-center bg-card/80 backdrop-blur-sm px-4 rounded-full shadow-md bg-white'>
                            {game.gameStatus == GameStatus.PLAYING ?
                                <>
                                    <Clock className='w-6 h-6 text-secondary' />
                                    <span className='text-2xl font-bold w-12 text-center text-secondary'>{timeLeft}s</span>
                                    <Progress value={progress} className='sm:w-105' color='secondary' />
                                </> : 
                                <Flex mxAuto={true} justify={'between'} className='sm:gap-36 gap-4'>
                                    <div className='flex items-center gap-1'>
                                        <CheckCircle className='w-6 h-6 text-secondary' />
                                        <span className='text-2xl text-secondary'>{game.correct}</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <ShieldX className='w-6 h-6 text-destructive text-secondary' />
                                        <span className='text-2xl text-secondary'>{game.wrong}</span>
                                    </div>
                                </Flex>
                            }
                        </div>
                        <div onClick={() => exitGameAction()} className='flex items-center backdrop-blur-sm px-4 rounded-full shadow-md bg-white hover:scale-105 transform cursor-pointer'>
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
        //TODO Show result screen
        return (
            <div className="relative flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden rounded-md  bounceIn">
                <Card className="z-10 p-4 sm:p-8 text-center max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
                    <CardHeader className='flex-col'>
                        <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight">{Constants.GAME_OVER_HEADER}</CardTitle>
                        <CardDescription className="text-base">{Constants.STATS_HEADER}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg">
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Award className="w-6 h-6 text-amber-500" />
                                <span className="font-medium text-white">{Constants.POINTS}</span>
                            </div>
                            <strong className="font-bold text-2xl text-amber-500">{game.point}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <span className="font-medium text-white">{Constants.CORRECT_ANSWER}</span>
                            </div>
                            <strong className="font-bold text-2xl text-green-500">{game.correct} / {game.total}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <ShieldX className="w-6 h-6 text-destructive text-red-500" />
                                <span className="font-medium text-white">{Constants.WRONG_ANSWER}</span>
                            </div>
                            <strong className="font-bold text-2xl text-red-500">{game.wrong}</strong>
                        </div>
                    </CardContent>
                    <CardFooter className='gap-1'>
                        <Button color='secondary' onClick={() => playAgainAction()} className="w-full text-2xl" size="lg">{Constants.PLAY_AGAIN_BUTTON}</Button>
                        <Button color='secondary' onClick={() => exitGameAction()} className="w-full text-2xl" size="lg">{Constants.MAIN_MENU_BUTTON}</Button>
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
            <Background>
                {gameBegin()}
            </Background>
        </>
    );
}

const mapDispatchToProps = {
    setGameStatus,
    setPoint,
    setResetGame
}
export default connect(null, mapDispatchToProps)(Home);