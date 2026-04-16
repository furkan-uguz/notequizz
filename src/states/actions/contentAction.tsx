import { Dispatch } from 'redux';

import Action from '../../utils/Action';
import { ActionType } from '../../constants/ActionType';
import { contentState, initialize } from '../reducers/contentReducer';
import { dispatcher } from '..';

export const setLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.isLoading = state;

    dispatcher(ActionType.CONTENT_LOADING, payload, dispatch);
}

export const setVideoLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.isVideoLoaded = state;

    dispatcher(ActionType.CONTENT_VIDEO_LOADING, payload, dispatch);
}

export const setFontLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.isFontLoaded = state;
    dispatcher(ActionType.CONTENT_FONT_LOADING, payload, dispatch);
}

export const setLoadingBar = (state: number) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.loadingBar = state;

    dispatcher(ActionType.CONTENT_LOADING_BAR, payload, dispatch);
}

export const setFingerprintInitStatus = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.isFingerPrintInited = state;

    dispatcher(ActionType.CONTENT_FINGERPRINT_INIT, payload, dispatch);
}

export const setVideoContent = (state: HTMLVideoElement) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.backgroundVideo = state;

    dispatcher(ActionType.CONTENT_SET_VIDEO, payload, dispatch);
}

export const setMusicLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.isMusicLoaded = state;

    dispatcher(ActionType.CONTENT_MUSIC_LOADING, payload, dispatch);
}

export const setSoundLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: contentState = initialize;
    payload.isSoundsLoaded = state;
    
    dispatcher(ActionType.CONTENT_SOUNDS_LOADING, payload, dispatch);
}