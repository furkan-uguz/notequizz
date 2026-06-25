/* eslint-disable @typescript-eslint/no-explicit-any */
import reducers from "./reducers";
import { Dispatch, configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import Action from "../utils/Action";
import { ActionType } from "../constants/ActionType";

const initialState: any = {};

const deferredLogger = {
	log: (...args: any[]) => queueMicrotask(() => console.log(...args)),
	info: (...args: any[]) => queueMicrotask(() => console.info(...args)),
	warn: (...args: any[]) => queueMicrotask(() => console.warn(...args)),
	error: (...args: any[]) => queueMicrotask(() => console.error(...args)),
	group: (...args: any[]) => queueMicrotask(() => console.group(...args)),
	groupCollapsed: (...args: any[]) => queueMicrotask(() => console.groupCollapsed(...args)),
	groupEnd: () => queueMicrotask(() => console.groupEnd()),
};

const logger = createLogger({
	collapsed: true,
	duration: true,
	diff: true,
	logger: deferredLogger,
	// Logların başına ayırt edici bir simge koyar
	titleFormatter: (action, time, took) => {
		return `📦 REDUX: ${String(action.type)} @ ${time} (in ${took.toFixed(2)} ms)`;
	},
	// Çok sık çalışan aksiyonları (timer gibi) gizleyerek gürültüyü azaltır
	predicate: (_getState, action) => {
		return ![
			ActionType.GAME_SET_TIME_LEFT, // Her saniye tetiklendiği için hiyerarşiyi çok bozar
		].includes(action.type);
	},
	// Renkleri özelleştirerek kendi loglarınızdan ayırabilirsiniz
	colors: {
		title: () => "#00e5ff", // Redux başlıkları turkuaz olsun
		prevState: () => "#9E9E9E",
		action: () => "#03A9F4",
		nextState: () => "#4CAF50",
		error: () => "#F20404",
	},
});

const store = configureStore({
	reducer: reducers,
	preloadedState: initialState,
	devTools: !import.meta.env.PROD,
	middleware: (getDefaultMiddleware) => {
		const middleware = getDefaultMiddleware({
			immutableCheck: false,
			serializableCheck: false,
		});
		if (!import.meta.env.PROD) {
			middleware.push(logger as any);
		}
		return middleware;
	},
});

export const dispatcher = (action: ActionType, payload: any, dispatch: Dispatch<Action>) => {
	dispatch({
		type: action,
		payload: payload,
	});
};

export default store;
