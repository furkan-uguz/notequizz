import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { connect, useSelector, ConnectedProps } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle, Clock, Flame, LogOut, ShieldX, Star, Music } from "lucide-react";
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react";

import { GameStatus } from "../constants/GameStatus";
import { GameMode } from "../constants/GameMode";
import { Constant } from "../constants/Constant";
import { setGameStatus, setPoint, setStreak, setResetGame, setGameMode, setGameTimeLeft, setQuestion } from "../states/actions/gameAction";
import { StateType } from "../states/reducers";
import { getQuestion, notes } from "../lib/Note";
import { playNoteSound, playEffect } from "../lib/Sound";
import Flex, { FlexType } from "../components/Flex";
import { NoteStaff } from "../components/NoteStaff";
import { cn } from "../utils/Util";

interface GameProps extends PropsFromRedux {
	initialSoundEffectsEnabled: boolean;
	initialNoteSoundType: "piano" | "oscillator";
	initialOscillatorType: OscillatorType;
	initialAnswerDisplayMode: "solfege" | "name";
	initialSelectedOctaves: Set<string>;
	initialShowOctaveBadge: boolean;
	initialButtonKeys: string[];
	feedBack: string | null;
	onExitGame: () => void;
}

const Game: FC<GameProps> = (props): JSX.Element => {
	const { initialSoundEffectsEnabled, initialNoteSoundType, initialOscillatorType, initialAnswerDisplayMode, initialSelectedOctaves, initialShowOctaveBadge, initialButtonKeys, onExitGame } = props;

	const [selection, setSelection] = useState<{
		answer: string;
		isCorrect: boolean;
	} | null>(null);
	const [soundEffectsEnabled] = useState(initialSoundEffectsEnabled);
	const [buttonKeys] = useState<string[]>(initialButtonKeys);
	const [noteSoundType] = useState<"piano" | "oscillator">(initialNoteSoundType);
	const [oscillatorType] = useState<OscillatorType>(initialOscillatorType);
	const [answerDisplayMode] = useState<"solfege" | "name">(initialAnswerDisplayMode);
	const [selectedOctaves] = useState<Set<string>>(initialSelectedOctaves);
	const [showOctaveBadge] = useState(initialShowOctaveBadge);
	const [pendingOption, setPendingOption] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<string | null>(null);

	const game = useSelector((state: StateType) => state.game);

	const progress = useMemo(() => (game.timeLeft / game.gameDuration) * 100, [game.timeLeft, game.gameDuration]);

	const timerColor = useMemo(() => {
		if (game.timeLeft <= 10) return "danger";
		if (game.timeLeft <= 30) return "warning";
		return "secondary";
	}, [game.timeLeft]);

	const octaveColor = useMemo(() => {
		const oct = game.question.correctNote.octave;
		if (oct <= 3) return "danger"; // Bas sesler (0, 1, 2, 3) - Kırmızı
		if (oct === 4) return "success"; // Orta sesler (4) - Yeşil
		if (oct <= 6) return "primary"; // Tiz sesler (5, 6) - Mavi
		return "secondary"; // Çok tiz (7) - Mor
	}, [game.question.correctNote.octave]);

	const loadNextQuestion = useCallback(
		(exclude1?: string | null, exclude2?: string | null) => {
			props.setQuestion(getQuestion(exclude1, exclude2, selectedOctaves));
			setSelection(null);
			setPendingOption(null);
		},
		[selectedOctaves, props],
	);

	const handleAnswer = useCallback(
		(answer: string) => {
			if (selection || !game.question) return;

			const isCorrect = answer === game.question.correctNote.solfege;
			let point = Constant.DEFAULT_POINT;
			let type = Constant.DEFAULT_POINT;

			if (isCorrect) {
				// Doğru cevap ses dosyası
				if (soundEffectsEnabled) playEffect("correct");

				const newStreak = game.streak + 1;
				props.setStreak(newStreak);

				// Seri 3, 5, 10 ve katlarına ulaştığında tebrik mesajı göster
				if (newStreak === 3 || newStreak % 5 === 0) {
					const messages = [
						Constant.CONFETTI_CELEBRATION_1,
						Constant.CONFETTI_CELEBRATION_2,
						Constant.CONFETTI_CELEBRATION_3,
						Constant.CONFETTI_CELEBRATION_4,
						Constant.CONFETTI_CELEBRATION_5,
					];
					setFeedback(messages[Math.floor(Math.random() * messages.length)]);

					// Konfeti Efekti
					confetti({
						particleCount: 150,
						spread: 70,
						origin: { y: 0.6 },
						colors: ["#22c55e", "#3b82f6", "#ef4444", "#eab308", "#a855f7"],
						disableForReducedMotion: true,
					});

					setTimeout(() => setFeedback(null), 1000);
				}

				// Puanı streak ile çarpıyoruz (Örn: 5, 10, 15...)
				point = Constant.GAINED_POINT * 5 * newStreak;
				type = Constant.GAINED_POINT;
			} else {
				// Yanlış cevap ses dosyası
				if (soundEffectsEnabled) playEffect("incorrect");

				props.setStreak(Constant.DEFAULT_POINT);
			}

			setSelection({ answer, isCorrect });
			props.setPoint({ point: point, type: type });

			setTimeout(() => {
				loadNextQuestion(game.question.correctNote.solfege, answer);
			}, 1200);
		},
		[selection, game.question, soundEffectsEnabled, game.streak, props, loadNextQuestion],
	);

	const matchOptions = useCallback(
		(e: KeyboardEvent) => {
			const pressedKey = e.key.toLowerCase();
			const index = buttonKeys.findIndex((k) => k.toLowerCase() === pressedKey);
			if (index >= 0 && index < game.question.options.length) {
				const option = game.question.options[index];
				if (game.gameMode === GameMode.LISTENING) {
					if (pendingOption === option) {
						handleAnswer(option);
					} else {
						setPendingOption(option);
						const noteToPlay = notes.find((n) => n.solfege === option && n.octave === game.question.correctNote.octave);
						if (noteToPlay) playNoteSound(noteToPlay, 1, noteSoundType, oscillatorType);
					}
				} else {
					handleAnswer(option);
				}
			}
		},
		[buttonKeys, game.question, game.gameMode, pendingOption, handleAnswer, noteSoundType, oscillatorType],
	);

	useEffect(() => {
		setFeedback(props.feedBack);
	}, [props.feedBack]);

	useEffect(() => {
		console.log("GAME[USEFFECT {2}]");
		// Sadece oyun veya alıştırma modundayken yeni bir soru geldiğinde notayı çal
		// Listen modunda otomatik çalma istenmiyor.
		if (game.question && game.gameMode !== GameMode.LISTENING && (game.gameStatus === GameStatus.PLAYING || game.gameStatus === GameStatus.EXERCISING)) {
			playNoteSound(game.question.correctNote, 1, noteSoundType, oscillatorType);
		}
	}, [game.question, game.gameStatus, noteSoundType, oscillatorType, game.gameMode]);

	useEffect(() => {
		console.log("GAME[USEFFECT {3}]");
		const handleKeyDown = (e: KeyboardEvent) => {
			// Eğer kullanıcı bir input (örneğin test alanı) içindeyse kısayolları çalıştırma
			if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

			if (game.gameStatus === GameStatus.PLAYING || game.gameStatus === GameStatus.EXERCISING) {
				if (!game.question) return;

				// Boşluk tuşu (Space) ile notayı tekrar çal
				if (e.code === "Space") {
					e.preventDefault();
					playNoteSound(game.question.correctNote, 1, noteSoundType, oscillatorType);
					return;
				}

				if (selection) return;

				matchOptions(e);
			}
		};

		globalThis.addEventListener("keydown", handleKeyDown);
		return () => globalThis.removeEventListener("keydown", handleKeyDown);
	}, [game.gameStatus, game.question, selection, noteSoundType, oscillatorType, matchOptions]);

	const exitGame = () => {
		onExitGame();
	};

	return (
		<div className="relative flex flex-col items-center justify-center min-h-screen w-svw p-4 opacity-anim">
			<AnimatePresence>
				{feedback && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5, y: 20 }}
						animate={{ opacity: 1, scale: 1.2, y: 0 }}
						exit={{ opacity: 0, scale: 1.5, y: -20 }}
						transition={{
							type: "spring",
							stiffness: 500,
							damping: 15,
						}}
						className="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none"
					>
						<span className="text-6xl sm:text-8xl font-black text-orange-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] italic tracking-tighter">{feedback}</span>
					</motion.div>
				)}
			</AnimatePresence>
			<div className="z-10 w-full max-w-2xl mx-auto flex flex-col gap-8">
				<header className="flex flex-row justify-between gap-1">
					<div className="flex items-center gap-2 p-2 px-4 rounded-full shadow-md bg-white">
						<Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
						<span className="text-2xl font-bold text-secondary">{game.point}</span>
						{game.streak > 1 && (
							<div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-orange-100 rounded-full animate-pulse">
								<Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
								<span className="text-sm font-bold text-orange-600">x{game.streak}</span>
							</div>
						)}
					</div>
					<div className="w-full flex items-center bg-card/80 backdrop-blur-sm px-4 rounded-full shadow-md bg-white">
						{game.gameStatus === GameStatus.PLAYING ? (
							<>
								<motion.div
									animate={game.timeLeft <= 5 ? { x: [-2, 2, -2, 2, 0] } : { x: 0 }}
									transition={{
										repeat: game.timeLeft <= 5 ? Infinity : 0,
										duration: 0.4,
									}}
								>
									<Clock className={cn("w-6 h-6", game.timeLeft <= 10 ? "text-danger" : game.timeLeft <= 30 ? "text-warning" : "text-secondary")} />
								</motion.div>
								<span className={cn("text-2xl font-bold w-12 text-center", game.timeLeft <= 10 ? "text-danger" : game.timeLeft <= 30 ? "text-warning" : "text-secondary")}>
									{game.timeLeft}s
								</span>
								<Progress value={progress} className="sm:w-105" color={timerColor} />
							</>
						) : (
							<Flex mxAuto={true} justify={"between"} className="sm:gap-36 gap-4">
								<div className="flex items-center gap-1">
									<CheckCircle className="w-6 h-6 text-green-500" />
									<span className="text-2xl text-green-500">{game.correct}</span>
								</div>
								<div className="flex items-center gap-1">
									<ShieldX className="w-6 h-6 text-destructive text-red-500" />
									<span className="text-2xl text-red-500">{game.wrong}</span>
								</div>
							</Flex>
						)}
					</div>
					<Button onPress={() => exitGame()} className="flex items-center backdrop-blur-sm px-4 rounded-full shadow-md bg-white hover:scale-115 duration-500 transform cursor-pointer">
						<LogOut className="text-secondary"></LogOut>
					</Button>
				</header>
				<main>
					<Card shadow="lg" className="bg-white overflow-hidden relative min-h-[240px]">
						<CardBody className="flex items-center justify-center py-10 overflow-visible">
							{showOctaveBadge && (
								<div className="absolute top-2 right-2 z-20">
									<Chip size="sm" variant="flat" color={octaveColor} className="font-bold">
										{Constant.OCTAVE_NAME + " " + game.question.correctNote.octave}
									</Chip>
								</div>
							)}
							<NoteStaff note={game.question.correctNote} volume={1} noteSoundType={noteSoundType} oscillatorType={oscillatorType} interactive={game.gameMode !== GameMode.LISTENING} />
						</CardBody>
					</Card>
				</main>
				<footer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{game.question.options.map((option, index) => {
						const isSelected = selection?.answer === option;
						const isCorrect = game.question.correctNote.solfege === option;

						// Seçilen moda göre buton metnini ayarla
						const noteForOption = notes.find((n) => n.solfege === option && n.octave === game.question.correctNote.octave);
						const displayLabel = answerDisplayMode === "solfege" ? option : noteForOption?.fullName || option;

						return (
							<Button
								key={index}
								onPress={() => {
									if (game.gameMode === GameMode.LISTENING) {
										if (pendingOption === option) {
											handleAnswer(option);
										} else {
											setPendingOption(option);
											const noteToPlay = notes.find((n) => n.solfege === option && n.octave === game.question.correctNote.octave);
											if (noteToPlay) playNoteSound(noteToPlay, 1, noteSoundType, oscillatorType);
										}
									} else {
										handleAnswer(option);
									}
								}}
								disabled={!!selection}
								className={cn(
									"h-20 text-3xl font-bold transition-all duration-300 transform hover:scale-105 text-secondary",
									selection && isCorrect && "bg-green-500 hover:bg-green-500 text-white scale-110 border-green-300 border-4",
									selection && isSelected && !isCorrect && "bg-red-800 text-white scale-110 border-red-600 border-4",
									selection && !isSelected && !isCorrect && "opacity-50",
									!selection && game.gameMode === GameMode.LISTENING && pendingOption === option && "ring-4 ring-warning ring-offset-2 scale-105 bg-warning text-white shadow-lg",
								)}
								variant="solid"
							>
								<Flex direction="col" justify={"between"} className="w-100">
									<FlexType flexType={"flex-1"} align={"end"}>
										{/* isMobile check is not needed here as it's passed as a prop */}
										<Flex justify="end">
											<span className="text-[20px] opacity-60 font-mono mb-1 leading-none text-blue-500">({buttonKeys[index]})</span>
										</Flex>
									</FlexType>
									<FlexType flexType={"flex-1"} align="center" justify="center">
										{game.gameMode === GameMode.LISTENING && !selection ? <Music className="w-10 h-10" /> : displayLabel}
									</FlexType>
								</Flex>
							</Button>
						);
					})}
				</footer>
			</div>
		</div>
	);
};

const connector = connect(null, {
	setGameStatus,
	setPoint,
	setStreak,
	setResetGame,
	setGameMode,
	setGameTimeLeft,
	setQuestion,
});

type PropsFromRedux = ConnectedProps<typeof connector>;
const ConnectedGame = connector(Game);

export default ConnectedGame;
