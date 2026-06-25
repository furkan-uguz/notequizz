import { FC, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { connect, useSelector, ConnectedProps } from "react-redux";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { Award, CheckCircle, Clock, Flame, LogOut, ShieldX, Volume2, BookOpen, Ear } from "lucide-react";
import { Button, Card, CardBody, CardFooter, CardHeader, Select, SelectItem, Slider, Switch, Input, Tabs, Tab } from "@heroui/react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

import Game from "./Game";

import Background from "../components/Background";
import Box from "../components/Box";
import Flex, { FlexType } from "../components/Flex";
import { CardContent, CardDescription, CardTitle } from "../components/Card";
import { AnimatedButton } from "../components/AnimatedButton";

import { GameStatus } from "../constants/GameStatus";
import { GameMode } from "../constants/GameMode";
import { Constant } from "../constants/Constant";

import { setGameStatus, setPoint, setStreak, setResetGame, setGameMode, setGameDuration, setGameTimeLeft, setMusicVolume, setQuestion } from "../states/actions/gameAction";
import { StateType } from "../states/reducers";

import { playFrequency, fadeBackgroundMusic, fadeInMusic, fadeOutMusic, controlBackgroundMusic } from "../lib/Sound";
import { getQuestion, Note, notes } from "../lib/Note";

const Home: FC<PropsFromRedux> = (props): JSX.Element => {
	const [tempSettings, setTempSettings] = useState({
		musicVolume: 0.5,
		duration: Constant.GAME_DURATION_MIN,
		soundEffectsEnabled: true,
		noteSoundType: "piano" as "piano" | "oscillator",
		oscillatorType: "sine" as OscillatorType,
		answerDisplayMode: "solfege" as "solfege" | "name",
		selectedOctaves: new Set(["3", "4", "5"]),
		showOctaveBadge: true,
		buttonKeys: ["1", "2", "3", "4"],
	});
	const [testValue, setTestValue] = useState("");
	const [feedback, setFeedback] = useState<string | null>(null);
	const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
	const [buttonKeys, setButtonKeys] = useState<string[]>(["1", "2", "3", "4"]);
	const [noteSoundType, setNoteSoundType] = useState<"piano" | "oscillator">("piano");
	const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");
	const [answerDisplayMode, setAnswerDisplayMode] = useState<"solfege" | "name">("solfege");
	const [selectedOctaves, setSelectedOctaves] = useState<Set<string>>(new Set(["3", "4", "5"]));
	const [showOctaveBadge, setShowOctaveBadge] = useState(true);
	const game = useSelector((state: StateType) => state.game);
	const content = useSelector((state: StateType) => state.content);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		console.group("UseEffect[HOME(1)]");

		console.trace("Setting up resize listener for mobile detection.");
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);

		console.groupEnd();
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		console.group("UseEffect[HOME(2)]");

		console.trace("Loading settings from localStorage.");
		const savedVolume = localStorage.getItem("settings_volume");
		const savedDuration = localStorage.getItem("settings_duration");
		const savedSFX = localStorage.getItem("settings_sfx");
		const savedNoteSoundType = localStorage.getItem("settings_note_sound_type");
		const savedOsc = localStorage.getItem("settings_oscillator");
		const savedDisplayMode = localStorage.getItem("settings_display_mode");
		const savedOctaves = localStorage.getItem("settings_octaves");
		const savedShowOctave = localStorage.getItem("settings_show_octave");
		const savedKeys = localStorage.getItem("settings_button_keys");

		if (savedVolume !== null) {
			const v = Number.parseFloat(savedVolume);
			props.setMusicVolume(v);
			controlBackgroundMusic("start", v);
			fadeBackgroundMusic(v, 1);
		}
		if (savedDuration !== null) {
			const d = Number.parseInt(savedDuration);
			props.setGameDuration(d);
			props.setGameTimeLeft(d);
		}
		if (savedSFX !== null) {
			setSoundEffectsEnabled(savedSFX === "true");
		}
		if (savedNoteSoundType !== null) {
			setNoteSoundType(savedNoteSoundType as "piano" | "oscillator");
		}
		if (savedOsc !== null) {
			setOscillatorType(savedOsc as OscillatorType);
		}
		if (savedDisplayMode !== null) {
			setAnswerDisplayMode(savedDisplayMode as "solfege" | "name");
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
			setShowOctaveBadge(savedShowOctave === "true");
		}
		if (savedKeys !== null) {
			try {
				const parsed = JSON.parse(savedKeys);
				if (Array.isArray(parsed) && parsed.length === 4) setButtonKeys(parsed);
			} catch (e) {
				console.error("Error parsing saved button keys", e);
			}
		}

		console.groupEnd();
	}, [content, props]);

	useEffect(() => {
		console.group("UseEffect[HOME(3)]");

		console.debug("Calculate new time left for the game. Current time left: [%d] sec, Game status: [%s]", game.timeLeft, game.gameStatus);
		const statusCurrent = game.gameStatus;
		const newTimeLeft = game.timeLeft - 1;

		if (game.gameStatus != GameStatus.PLAYING) {
			console.groupEnd();
			return;
		}
		if (game.timeLeft <= 0) {
			endGameAction();
			console.groupEnd();
			return;
		}

		const timerId = setInterval(() => {
			if (statusCurrent == GameStatus.PLAYING) props.setGameTimeLeft(newTimeLeft);
		}, 1000);

		gameBegin();

		console.groupEnd();
		return () => clearInterval(timerId);
	}, [game.timeLeft, game.gameStatus, props]);

	const endGameAction = () => {
		props.setGameStatus(GameStatus.END);
		fadeInMusic(game.musicVolume);

		// Firebase Analytics: Oyun verilerini logla
		isSupported().then((supported) => {
			if (supported) {
				const analytics = getAnalytics();
				logEvent(analytics, "level_end", {
					score: game.point,
					duration_seconds: game.gameDuration,
					correct_count: game.correct,
					wrong_count: game.wrong,
					max_streak: game.totalStreak,
				});
			}
		});
	};

	const startGameAction = (gameMode: GameMode) => {
		props.setResetGame();
		props.setGameMode(gameMode);
		props.setGameStatus(GameStatus.PLAYING);
		props.setGameTimeLeft(game.gameDuration);
		props.setQuestion(getQuestion(null, null, selectedOctaves));
		fadeOutMusic(game.musicVolume);

		// Firebase Analytics: Oyun başlangıcını logla
		isSupported().then((supported) => {
			if (supported) {
				const analytics = getAnalytics();
				logEvent(analytics, "game_start", {
					mode: "classic",
					duration_seconds: game.gameDuration,
				});
			}
		});
	};

	const selectExerciseModeAction = () => {
		props.setGameStatus(GameStatus.SELECTING_EXERCISE_MODE);
	};

	const startExerciseAction = (gameMode: GameMode) => {
		props.setResetGame();
		props.setGameMode(gameMode);
		props.setGameStatus(GameStatus.EXERCISING);
		props.setQuestion(getQuestion(null, null, selectedOctaves));
		fadeOutMusic(game.musicVolume);

		// Firebase Analytics: Alıştırma modu başlangıcını logla
		isSupported().then((supported) => {
			if (supported) {
				const analytics = getAnalytics();
				logEvent(analytics, "game_start", {
					mode: `exercise_${GameMode[gameMode].toLowerCase()}`,
				});
			}
		});
	};

	const playAgainAction = () => {
		if (game.gameStatus === GameStatus.EXERCISING) {
			startExerciseAction(game.gameMode);
		} else {
			startGameAction(game.gameMode);
		}
	};

	const settingsAction = () => {
		setTempSettings({
			musicVolume: game.musicVolume,
			duration: game.gameDuration,
			soundEffectsEnabled,
			noteSoundType,
			oscillatorType,
			answerDisplayMode,
			selectedOctaves: new Set(selectedOctaves),
			showOctaveBadge,
			buttonKeys: [...buttonKeys],
		});
		props.setGameStatus(GameStatus.SETTINGS);
	};

	const selectModeAction = () => {
		props.setGameStatus(GameStatus.SELECTING_MODE);
	};

	const exitGameAction = () => {
		props.setResetGame();
		props.setGameStatus(GameStatus.START);
		props.setGameTimeLeft(game.gameDuration);
		fadeInMusic(game.musicVolume);
	};

	const highScoresAction = () => {};

	const saveSettings = () => {
		localStorage.setItem("settings_volume", game.musicVolume.toString());
		localStorage.setItem("settings_duration", game.gameDuration.toString());
		localStorage.setItem("settings_sfx", soundEffectsEnabled.toString());
		localStorage.setItem("settings_note_sound_type", noteSoundType);
		localStorage.setItem("settings_oscillator", oscillatorType);
		localStorage.setItem("settings_display_mode", answerDisplayMode);
		localStorage.setItem("settings_octaves", JSON.stringify(Array.from(selectedOctaves)));
		localStorage.setItem("settings_show_octave", showOctaveBadge.toString());
		localStorage.setItem("settings_button_keys", JSON.stringify(buttonKeys));
		props.setGameStatus(GameStatus.START);
	};

	const cancelSettings = () => {
		setSoundEffectsEnabled(tempSettings.soundEffectsEnabled);
		setNoteSoundType(tempSettings.noteSoundType);
		setOscillatorType(tempSettings.oscillatorType);
		setAnswerDisplayMode(tempSettings.answerDisplayMode);
		setSelectedOctaves(tempSettings.selectedOctaves);
		setShowOctaveBadge(tempSettings.showOctaveBadge);
		setButtonKeys(tempSettings.buttonKeys);
		fadeBackgroundMusic(tempSettings.musicVolume, 0);
		props.setMusicVolume(tempSettings.musicVolume);
		props.setGameDuration(tempSettings.duration);
		props.setGameStatus(GameStatus.START);
	};

	const resetToDefaults = () => {
		props.setGameDuration(Constant.GAME_DURATION_MIN);
		setSoundEffectsEnabled(true);
		setNoteSoundType("piano");
		setOscillatorType("sine");
		setAnswerDisplayMode("solfege");
		setSelectedOctaves(new Set(["3", "4", "5"]));
		setShowOctaveBadge(true);
		setButtonKeys(["1", "2", "3", "4"]);
	};

	const handleVolumeChange = (value: number | number[]) => {
		const val = Array.isArray(value) ? value[0] : value;
		props.setMusicVolume(val);
		fadeBackgroundMusic(val, 0.1); // Slider değişimlerinde pürüzsüz küçük geçiş
	};

	const handleTestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.toUpperCase();
		setTestValue(val);

		// notes dizisinden girilen fullName ile eşleşen notayı buluyoruz
		const foundNote = notes.find((n: Note) => n.fullName === val);
		if (foundNote) {
			props.setQuestion({
				correctNote: foundNote,
				options: game.question.options,
				play: () => playFrequency(foundNote.frequency),
			});
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
			colors: ["#22c55e", "#3b82f6", "#ef4444", "#eab308", "#a855f7"],
			disableForReducedMotion: true,
		});

		setTimeout(() => setFeedback(null), 1000);
	};

	const gameBegin = (): JSX.Element => {
		if (game.gameStatus == GameStatus.START) return readyGame();
		else if (game.gameStatus == GameStatus.SELECTING_MODE || game.gameStatus == GameStatus.SELECTING_EXERCISE_MODE) return selectMode();
		else if (game.gameStatus == GameStatus.PLAYING || game.gameStatus == GameStatus.EXERCISING)
			return (
				<Game
					initialSoundEffectsEnabled={soundEffectsEnabled}
					initialNoteSoundType={noteSoundType}
					initialOscillatorType={oscillatorType}
					initialAnswerDisplayMode={answerDisplayMode}
					initialButtonKeys={buttonKeys}
					initialSelectedOctaves={selectedOctaves}
					initialShowOctaveBadge={showOctaveBadge}
					onExitGame={exitGameAction}
					feedBack={feedback}
				/>
			);
		else if (game.gameStatus == GameStatus.SETTINGS) return settings();
		else return endGame();
	};

	const readyGame = (): JSX.Element => {
		return (
			<Box size={"sm"} mxAuto={true} className="opacity-anim">
				<Flex mxAuto={true} align="center" justify="center" className="p-3 flex-col gap-4">
					<FlexType flexType="flex-auto" mxAuto={true} className="text-6xl text-white drop-shadow-md antialiased animate-bounce">
						{Constant.APP_NAME}
					</FlexType>
					<FlexType flexType="flex-auto" className="antialiased opacity-anim">
						<AnimatedButton color="secondary" onPress={() => selectModeAction()} className="text-2xl w-40">
							{Constant.START_BUTTON}
						</AnimatedButton>
					</FlexType>
					<FlexType flexType="flex-auto" className="antialiased opacity-anim">
						<AnimatedButton color="secondary" onPress={() => selectExerciseModeAction()} className="text-2xl w-40">
							{Constant.EXERCISE_BUTTON}
						</AnimatedButton>
					</FlexType>
					<FlexType flexType="flex-auto" className="antialiased opacity-anim">
						<AnimatedButton color="secondary" onPress={() => settingsAction()} className="text-2xl w-40">
							{Constant.SETTINGS_BUTTON}
						</AnimatedButton>
					</FlexType>
					<FlexType flexType="flex-auto" className="antialiased opacity-anim">
						<AnimatedButton color="secondary" onPress={() => highScoresAction()} className="text-2xl w-40">
							{Constant.HIGH_SCORES_BUTTON}
						</AnimatedButton>
					</FlexType>
				</Flex>
			</Box>
		);
	};

	const selectMode = (): JSX.Element => {
		const isExercise = game.gameStatus === GameStatus.SELECTING_EXERCISE_MODE;
		const handleSelectMode = (mode: GameMode) => {
			if (isExercise) {
				startExerciseAction(mode);
			} else {
				startGameAction(mode);
			}
		};

		return (
			<Box size={"sm"} mxAuto={true} className="opacity-anim">
				<Flex mxAuto={true} align="center" justify="center" className="p-3 flex-col gap-4">
					<FlexType flexType="flex-auto" mxAuto={true} className="text-6xl text-white drop-shadow-md antialiased animate-bounce">
						{Constant.APP_NAME}
					</FlexType>
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className="flex flex-col gap-4 w-full items-center justify-center mt-4 px-4 max-w-5xl"
					>
						<div className="flex flex-row">
							<AnimatedButton
								containerClassName="flex-1 px-2"
								color="secondary"
								onPress={() => handleSelectMode(GameMode.READING)}
								className="w-40 h-20 text-2xl text-white flex flex-col items-center justify-center transition-all duration-300"
							>
								<BookOpen className="w-15 h-15 text-white" />
								{Constant.READ_BUTTON}
							</AnimatedButton>
							<AnimatedButton
								containerClassName="flex-1 px-2"
								color="secondary"
								onPress={() => handleSelectMode(GameMode.LISTENING)}
								className="w-40 h-20 text-2xl text-white flex flex-col items-center justify-center transition-all duration-300"
							>
								<Ear className="w-15 h-15 text-white" />
								{Constant.LISTEN_BUTTON}
							</AnimatedButton>
						</div>
						<div className="flex flex-row">
							<AnimatedButton
								motionProps={{
									whileHover: { y: -10, scale: 1.01 },
								}}
								containerClassName="w-full h-24"
								color="secondary"
								onPress={() => props.setGameStatus(GameStatus.START)}
								className="w-85 h-10 text-2xl text-white flex flex-row gap-4 items-center justify-center transition-all duration-300"
							>
								<LogOut className="w-5 h-5 text-white rotate-180" />
								{Constant.MAIN_MENU_BUTTON}
							</AnimatedButton>
						</div>
					</motion.div>
				</Flex>
			</Box>
		);
	};

	const endGame = (): JSX.Element => {
		return (
			<div className="relative flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden rounded-md  bounceIn">
				<Card className="z-10 p-4 sm:p-8 text-center max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
					<CardHeader className="flex-col">
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
							<strong className="font-bold text-2xl text-green-500">
								{game.correct} / {game.total}
							</strong>
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
								<Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
								<span className="font-medium text-white">{Constant.STREAK}</span>
							</div>
							<strong className="font-bold text-2xl text-orange-500">{game.totalStreak}</strong>
						</div>
					</CardContent>
					<CardFooter className="gap-1">
						<Button color="secondary" onPress={() => playAgainAction()} className="w-full text-2xl hover:scale-105" size="lg">
							{Constant.PLAY_AGAIN_BUTTON}
						</Button>
						<Button color="secondary" onPress={() => exitGameAction()} className="w-full text-2xl hover:scale-105" size="lg">
							{Constant.MAIN_MENU_BUTTON}
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	};

	const settings = (): JSX.Element => {
		return (
			<div className="relative flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden rounded-md  bounceIn">
				<Card className="z-10 p-4 sm:p-8 text-center max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
					<CardHeader className="flex-col">
						<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-secondary">{Constant.SETTINGS_HEADER}</h2>
						<p className="text-base text-default-500">{Constant.SETTINGS_DESC}</p>
					</CardHeader>
					<CardBody className="text-lg">
						<Tabs fullWidth size="md" aria-label="Settings Tabs" color="secondary" variant="underlined">
							<Tab key="general" title={Constant.SETTINGS_TAB_GENERAL}>
								<div className="flex flex-col gap-4 mt-4">
									<div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
										<Slider
											label={Constant.SETTINGS_GAME_DURATION_LABEL}
											step={10}
											maxValue={Constant.GAME_DURATION_MAX}
											minValue={Constant.GAME_DURATION_MIN}
											value={game.gameDuration}
											onChange={(v) => props.setGameDuration(Array.isArray(v) ? v[0] : v)}
											startContent={<Clock className="text-secondary w-5 h-5" />}
											color="secondary"
										/>
									</div>
									<div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
										<Select
											label={Constant.SETTINGS_OCTAVES_LABEL}
											selectionMode="multiple"
											selectedKeys={selectedOctaves}
											onSelectionChange={(keys) => {
												if ((keys as Set<string>).size > 0) {
													setSelectedOctaves(keys as Set<string>);
												}
											}}
											color="secondary"
											variant="flat"
											renderValue={(items) => {
												if (isMobile && items.length > 3) {
													return `${items
														.slice(0, 3)
														.map((item) => item.textValue)
														.join(", ")} ...`;
												}
												return items.map((item) => item.textValue).join(", ");
											}}
										>
											{["0", "1", "2", "3", "4", "5", "6", "7"].map((octave) => (
												<SelectItem key={octave} textValue={`Octave ${octave}`}>
													{Constant.SETTINGS_OCTAVES_LABEL_PREFIX} {octave}
												</SelectItem>
											))}
										</Select>
									</div>
									<div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
										<Select
											label={Constant.SETTINGS_DISPLAY_MODE_LABEL}
											selectedKeys={[answerDisplayMode]}
											onSelectionChange={(keys) => {
												const val = Array.from(keys)[0] as string;
												if (val) setAnswerDisplayMode(val as "solfege" | "name");
											}}
											color="secondary"
											variant="flat"
										>
											<SelectItem key="solfege">{Constant.SETTINGS_DISPLAY_MODE_SOLFEGE}</SelectItem>
											<SelectItem key="name">{Constant.SETTINGS_DISPLAY_MODE_SCIENTIFIC}</SelectItem>
										</Select>
									</div>
									<div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
										<span className="text-sm font-medium text-foreground">{Constant.SETTINGS_SHOW_OCTAVE_LABEL}</span>
										<Switch isSelected={showOctaveBadge} onValueChange={setShowOctaveBadge} color="secondary" />
									</div>
								</div>
							</Tab>
							<Tab key="audio" title={Constant.SETTINGS_TAB_AUDIO}>
								<div className="flex flex-col gap-4 mt-4">
									<div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
										<Slider
											label={Constant.MAIN_MENU_SOUND_LABEL}
											step={0.01}
											maxValue={1}
											minValue={0}
											value={game.musicVolume}
											onChange={handleVolumeChange}
											startContent={<Volume2 className="text-secondary w-5 h-5" />}
											color="secondary"
										/>
									</div>
									<div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
										<span className="text-sm font-medium text-foreground">{Constant.SETTINGS_SFX_LABEL}</span>
										<Switch isSelected={soundEffectsEnabled} onValueChange={setSoundEffectsEnabled} color="secondary" />
									</div>
									<div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
										<Select
											label={Constant.SETTINGS_NOTE_SOUND_TYPE_LABEL}
											selectedKeys={[noteSoundType]}
											onSelectionChange={(keys) => {
												const val = Array.from(keys)[0] as string;
												if (val) setNoteSoundType(val as "piano" | "oscillator");
											}}
											color="secondary"
											variant="flat"
										>
											<SelectItem key="piano">{Constant.SETTINGS_NOTE_SOUND_TYPE_PIANO}</SelectItem>
											<SelectItem key="oscillator">{Constant.SETTINGS_NOTE_SOUND_TYPE_OSCILLATOR}</SelectItem>
										</Select>
									</div>
									{noteSoundType === "oscillator" && (
										<div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
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
								</div>
							</Tab>
							{!isMobile && (
								<Tab key="controls" title={Constant.SETTINGS_TAB_CONTROLS}>
									<div className="flex flex-col gap-4 mt-4">
										<div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg">
											<span className="text-sm font-medium text-foreground self-start">{Constant.SETTINGS_BUTTON_KEYS_LABEL}</span>
											<div className="flex gap-2 justify-center">
												{buttonKeys.map((key, idx) => (
													<Input
														key={idx}
														className="w-16"
														size="sm"
														value={key}
														onKeyDown={(e) => {
															e.preventDefault();
															const newKeys = [...buttonKeys];
															const newKey = e.key.toUpperCase();
															if (newKey.length === 1) {
																const existingIndex = buttonKeys.findIndex((k, i) => i !== idx && k.toUpperCase() === newKey);
																if (existingIndex === -1) {
																	newKeys[idx] = newKey;
																	setButtonKeys(newKeys);
																}
															}
														}}
														classNames={{
															input: "text-center font-bold",
														}}
													/>
												))}
											</div>
										</div>
									</div>
								</Tab>
							)}
						</Tabs>
					</CardBody>
					<CardFooter className="flex-col gap-2">
						<div className="flex w-full gap-2">
							<Button color="secondary" onPress={() => saveSettings()} className="w-full text-xl hover:scale-105" size="lg">
								{Constant.SAVE_BUTTON}
							</Button>
							<Button color="secondary" onPress={() => cancelSettings()} className="w-full text-xl hover:scale-105" size="lg">
								{Constant.CANCEL_BUTTON}
							</Button>
						</div>
						<Button variant="flat" color="default" onPress={() => resetToDefaults()} className="w-full text-lg hover:scale-105" size="lg">
							{Constant.RESET_DEFAULT_BUTTON}
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	};

	return (
		<>
			<Helmet>
				<meta charSet="utf-8" />
				<title>{Constant.APP_NAME}</title>
			</Helmet>
			{/* TEST INPUT: Sadece geliştirme sürecinde dizeği kontrol etmek için */}
			{import.meta.env.DEV && (
				<div className="fixed top-4 left-4 z-[100] opacity-80 hover:opacity-100 transition-opacity flex gap-2">
					<input
						type="text"
						value={testValue}
						onChange={handleTestInputChange}
						placeholder="Test: C4, A3..."
						className="w-32 p-2 bg-white/90 text-black border-2 border-secondary rounded-lg shadow-lg font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<button onClick={triggerTestFeedback} className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg font-bold hover:scale-105 active:scale-95 transition-transform">
						🎉 Test
					</button>
				</div>
			)}
			<Background blurBackground={game.gameStatus == GameStatus.END}>{gameBegin()}</Background>
		</>
	);
};

const connector = connect(null, {
	setGameStatus,
	setPoint,
	setStreak,
	setResetGame,
	setGameMode,
	setGameDuration,
	setGameTimeLeft,
	setMusicVolume,
	setQuestion,
});

type PropsFromRedux = ConnectedProps<typeof connector>;
const ConnectedHome = connector(Home);

export default ConnectedHome;
