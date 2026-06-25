import { State } from ".";
import Action from "../../utils/Action";
import { GameStatus } from "../../constants/GameStatus";
import { GameMode } from "../../constants/GameMode";
import { Constant } from "../../constants/Constant";
import { ActionType } from "../../constants/ActionType";
import { getQuestion, Question } from "../../lib/Note";

export interface GameState extends State {
	isLoading: boolean;
	gameStatus: GameStatus;
	gameMode: GameMode;
	point: number;
	correct: number;
	wrong: number;
	total: number;
	streak: number;
	totalStreak: number;
	gameDuration: number;
	timeLeft: number;
	musicVolume: number;
	question: Question;
}

export interface AnswerState {
	point: number;
	type: number;
}

export const initialize: GameState = {
	isInit: false,
	isLoading: true,
	gameStatus: GameStatus.START,
	gameMode: GameMode.NONE,
	point: 0,
	correct: 0,
	wrong: 0,
	total: 0,
	streak: 0,
	totalStreak: 0,
	gameDuration: Constant.GAME_DURATION_MIN,
	timeLeft: Constant.GAME_DURATION_MIN,
	musicVolume: 0,
	question: getQuestion(),
};

const defaultInit: GameState = {
	isInit: false,
	isLoading: true,
	gameStatus: GameStatus.START,
	gameMode: GameMode.NONE,
	point: Constant.DEFAULT_POINT,
	correct: 0,
	wrong: 0,
	total: 0,
	streak: 0,
	totalStreak: 0,
	gameDuration: Constant.GAME_DURATION_MIN,
	timeLeft: Constant.GAME_DURATION_MIN,
	musicVolume: 0,
	question: getQuestion(),
};

const gameReducer = (state: GameState = initialize, action: Action) => {
	let newState: GameState = { ...state };
	newState.isInit = true;
	switch (action.type) {
		case ActionType.GAME_LOADING:
			newState.isLoading = action.payload.isLoading;
			break;
		case ActionType.GAME_SET_USER_POINT:
			newState.point += action.payload.point;
			newState.correct += action.payload.type == Constant.GAINED_POINT ? 1 : 0;
			newState.wrong += action.payload.type == Constant.DEFAULT_POINT ? 1 : 0;
			newState.total = newState.correct + newState.wrong;
			break;
		case ActionType.GAME_CHANGE_STATUS:
			newState.gameStatus = action.payload.gameStatus;
			break;
		case ActionType.GAME_REFRESH:
			newState = defaultInit;
			newState.isInit = true;
			newState.gameDuration = state.gameDuration;
			newState.musicVolume = state.musicVolume;
			break;
		case ActionType.GAME_SET_STREAK:
			newState.streak = action.payload.streak;
			newState.totalStreak += action.payload.streak >= 2 ? 1 : 0;
			break;
		case ActionType.GAME_SET_MODE:
			newState.gameMode = action.payload.gameMode;
			break;
		case ActionType.GAME_SET_DURATION:
			newState.gameDuration = action.payload.gameDuration;
			newState.timeLeft = action.payload.gameDuration;
			break;
		case ActionType.GAME_SET_TIME_LEFT:
			newState.timeLeft = action.payload.timeLeft;
			break;
		case ActionType.GAME_SET_MUSIC_VOLUME:
			newState.musicVolume = action.payload.musicVolume;
			break;
		case ActionType.GAME_SET_QUESTION:
			newState.question = action.payload.question;
			break;
		default:
			return state;
	}
	return newState;
};

export default gameReducer;
