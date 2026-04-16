import {ActionType} from "../constants/ActionType";
import reducers from "./reducers";
import { Dispatch, configureStore } from "@reduxjs/toolkit";
import Action from "../utils/Action";

const initialState: any = {};

const store = configureStore({
    reducer: reducers,
    preloadedState: initialState,
    devTools: !import.meta.env.PROD,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false
    })
});

export const dispatcher = (action: ActionType, payload: any, dispatch: Dispatch<Action>) => {
    dispatch({
        type: action,
        payload: payload
    });
}

export default store;