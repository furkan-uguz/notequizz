import { Dispatch } from "redux";
import Action from "../../utils/Action";
import { ActionType } from "../../constants/ActionType";
import { AnswerState, GameState, initialize } from "../reducers/gameReducer";
import { dispatcher } from "..";
import { GameStatus } from "../../constants/GameStatus";
import { GameMode } from "../../constants/GameMode";
import { Question } from "../../lib/Note";

export const setGameLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.isLoading = state;

	dispatcher(ActionType.GAME_LOADING, payload, dispatch);
};

export const setPoint = (answer: AnswerState) => (dispatch: Dispatch<Action>) => {
	dispatcher(ActionType.GAME_SET_USER_POINT, answer, dispatch);
};

export const setStreak = (streak: number) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.streak = streak;

	dispatcher(ActionType.GAME_SET_STREAK, payload, dispatch);
};

export const setResetGame = () => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;

	dispatcher(ActionType.GAME_REFRESH, payload, dispatch);
};

export const setGameStatus = (status: GameStatus) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.gameStatus = status;

	dispatcher(ActionType.GAME_CHANGE_STATUS, payload, dispatch);
};

export const setGameDuration = (duration: number) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.gameDuration = duration;

	dispatcher(ActionType.GAME_SET_DURATION, payload, dispatch);
};

export const setGameTimeLeft = (timeLeft: number) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.timeLeft = timeLeft;

	dispatcher(ActionType.GAME_SET_TIME_LEFT, payload, dispatch);
};

export const setGameMode = (mode: GameMode) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.gameMode = mode;

	dispatcher(ActionType.GAME_SET_MODE, payload, dispatch);
};

export const setMusicVolume = (volume: number) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.musicVolume = volume;

	dispatcher(ActionType.GAME_SET_MUSIC_VOLUME, payload, dispatch);
};

export const setQuestion = (question: Question) => (dispatch: Dispatch<Action>) => {
	const payload: GameState = initialize;
	payload.question = question;

	dispatcher(ActionType.GAME_SET_QUESTION, payload, dispatch);
};
