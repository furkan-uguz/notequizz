import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { connect, useSelector } from 'react-redux';
import Background from '../components/Background';
import Box from '../components/Box';
import Constants, { GameStatus } from '../utils/Const';
import { setGameStatus, setPoint } from '../states/actions/gameActions';
import { StateType } from '../states/reducers';
import { getQuestion, Question } from '../lib/Notes';
import { Clock, LogOut, Star } from 'lucide-react';
import Flex, { FlexType } from '../components/Flex';
import { Button, Card, CardBody, Progress } from '@heroui/react';
import { NoteStaff } from '../components/NoteStaff';
import { cn } from '../lib/utils';

interface IHome {
    setGameStatus: Function;
    setPoint: Function;
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
        let point = 0;
        setSelection({ answer, isCorrect });

        if (isCorrect) {
            point = Constants.GAINED_POINT;
        }
        props.setPoint(game.point + point);

        setTimeout(() => {
            loadNextQuestion();
        }, 1200);
    };

    const endGameAction = () => {
        props.setGameStatus(GameStatus.END);
    };

    const startGameAction = () => {
        loadNextQuestion();
        props.setPoint(0);
        props.setGameStatus(GameStatus.PLAYING);
        setTimeLeft(Constants.GAME_DURATION_MIN);
    }

    const startExerciseModeAction = () => {
        loadNextQuestion();
        props.setPoint(0);
        props.setGameStatus(GameStatus.EXERCISING);
    }

    const exitGameAction = () => {
        props.setGameStatus(GameStatus.START);
        props.setPoint(0);
        setTimeLeft(Constants.GAME_DURATION_MIN);
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
            <div className='relative flex flex-col items-center justify-center min-h-screen w-svw p-4'>
                <div className='z-10 w-full max-w-2xl mx-auto flex flex-col gap-8'>
                    <header className='flex flex-row justify-between gap-1'>
                        <div className='flex items-center gap-2 p-2 px-4 rounded-full shadow-md bg-white'>
                            <Star className='w-6 h-6 text-secondary' />
                            <span className='text-2xl font-bold text-secondary'>{game.point}</span>
                        </div>
                        {game.gameStatus == GameStatus.PLAYING ?
                            <div className='w-full flex items-center bg-card/80 backdrop-blur-sm px-4 rounded-full shadow-md bg-white'>
                                <Clock className='w-6 h-6 text-secondary' />
                                <span className='text-2xl font-bold w-12 text-center'>{timeLeft}s</span>
                                <Progress value={progress} className='sm:w-105' color='secondary' />
                            </div>
                            : <></>
                        }
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
        return (<></>);
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
    setPoint
}
export default connect(null, mapDispatchToProps)(Home);