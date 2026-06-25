import { combineReducers } from "redux";
import { useSelector, TypedUseSelectorHook } from "react-redux";

import contentReducer, { ContentState } from "./contentReducer";
import gameReducer, { GameState } from "./gameReducer";
import { ConfigureStoreOptions } from "@reduxjs/toolkit";

const reducers = combineReducers({
	content: contentReducer,
	game: gameReducer,
});

export interface State {
	isInit: boolean;
}

interface RootState {
	content: ContentState;
	game: GameState;
}

export default reducers;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export type StateType = ReturnType<typeof reducers>;
export type Configured = ConfigureStoreOptions<{
	content: ContentState;
	game: GameState;
}>;
