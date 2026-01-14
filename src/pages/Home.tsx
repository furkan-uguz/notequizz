import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { connect, useSelector } from 'react-redux';
import Background from '../components/Background';
import Box from '../components/Box';
import Constants, { GameStatus } from '../utils/Const';
import { setGameStatus, setPoint } from '../states/actions/gameActions';
import { StateType } from '../states/reducers';
import { getQuestion, Question } from '../lib/Notes';
import { Clock, Star } from 'lucide-react';
import Flex, { FlexType } from '../components/Flex';
import { Button, Card, Progress } from '@heroui/react';
import { NoteStaff } from '../components/NoteStaff';

interface IHome {
    setGameStatus: Function;
    setPoint: Function;
}

const Home: FC<IHome> = ({ ...props }: IHome): JSX.Element => {
    const [timeLeft, setTimeLeft] = useState(Constants.GAME_DURATION_MIN); //TODO İleride ayarlar kısmından süresi max min ayarlanacak.
    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState<Question>(getQuestion());
    const [stats, setStats] = useState({ correct: 0, total: 0 });
    const [selection, setSelection] = useState<{ answer: string; isCorrect: boolean } | null>(null);
    const [loaded, setLoaded] = useState(false);
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
        if (timeLeft <= 0) {
            endGameAction();
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, score, stats]);

    useEffect(() => {
        if (!loaded)
            setLoaded(true);
    }, []);

    const handleAnswer = (answer: string) => {
        if (selection || !question) return;

        const isCorrect = answer === question.correctNote.solfege;
        setSelection({ answer, isCorrect });

        if (isCorrect) {
            setScore(s => s + 5);
        }
        setStats(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));

        setTimeout(() => {
            loadNextQuestion();
        }, 1200);
    };

    const endGameAction = () => {
        props.setGameStatus(GameStatus.END);
    };


    const startGameAction = () => {
        props.setGameStatus(GameStatus.PLAYING);
        props.setPoint(0);
        setTimeLeft(Constants.GAME_DURATION_MIN);
        loadNextQuestion();
    }

    const gameBegin = (): JSX.Element => {
        if (game.gameStatus != GameStatus.PLAYING)
            return readyGame();
        else
            return startGame();
    }

    const readyGame = (): JSX.Element => {
        return (
            <>
                <Box size={'sm'} mxAuto={true}>
                    <Flex mxAuto={true} align='center' justify='center' className='p-3 flex-col gap-4'>
                        <FlexType flexType='flex-auto' mxAuto={true} className='text-6xl text-white drop-shadow-md antialiased opacity-anim'>{Constants.APP_NAME}</FlexType>
                        <FlexType flexType='flex-auto'><Button color='secondary' onClick={() => startGameAction()}>{Constants.START_BUTTON}</Button></FlexType>
                    </Flex>
                </Box>
            </>
        );
    }

    const startGame = (): JSX.Element => {
        return (
            <div className='relative flex flex-col items-center justify-center min-h-screen w-svh p-4 overflow-hidden'>
                <div className='z-10 w-full max-w-2xl mx-auto flex flex-col gap-8'>
                    <header className='flex sm:flex-row justify-between items-center gap-4'>
                        <div className='flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 px-4 rounded-full shadow-md bg-white'>
                            <Star className='w-6 h-6 text-secondary' />
                            <span className='text-2xl font-bold text-secondary'>{score}</span>
                        </div>
                        <div className='w-full sm:w-auto flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 px-4 rounded-full shadow-md bg-white'>
                            <Clock className='w-6 h-6 text-secondary' />
                            <span className='text-2xl font-bold w-12 text-center'>{timeLeft}s</span>
                            <Progress value={progress} className='w-32' color='secondary' />
                        </div>
                    </header>
                    <main>
                        <Card className="p-8 bg-card/80 backdrop-blur-sm shadow-xl bg-white">
                            <NoteStaff note={question.correctNote} />
                        </Card>
                    </main>
                </div>
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
    setPoint
}
export default connect(null, mapDispatchToProps)(Home);