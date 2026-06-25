import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ConnectedProps, Provider, connect, useSelector } from "react-redux";
import { getAnalytics, isSupported, setUserProperties } from "firebase/analytics";
import { HeroUIProvider } from "@heroui/react";
import Router from "./router";
import AuthContext, { AuthContextProvider } from "./contexts/AuthContext";
import store from "./states";
import { StateType } from "./states/reducers";
import { setGameLoading } from "./states/actions/gameAction";
import { setVideoLoading, setVideoContent, setMusicLoading, setSoundLoading } from "./states/actions/contentAction";
import { Constant } from "./constants/Constant";
import Loading from "./pages/Loading";
import usePageView from "./hooks/useAnalytics";
import { ChalkLogger } from "./utils/ChalkLogger";
import { Initializer } from "./utils/Initializer";

if (import.meta.env.PROD) {
	console.debug = () => {};
	console.trace = () => {};
}

const App: FC<PropsFromRedux> = (props): JSX.Element => {
	const [authenticatedUser, setAuthenticatedUser] = useState<AuthContextProvider>();
	const [authLocale, setAuthLocale] = useState(Constant.GUEST_USER);
	const [componentsInit, setComponentsInit] = useState(false);
	const content = useSelector((state: StateType) => state.content);
	const game = useSelector((state: StateType) => state.game);
	const navigate = useNavigate();
	const isInitializationStarted = useRef(false);
	const logger = new ChalkLogger("#0acaffff", "Main");

	usePageView();

	const buildAuthenticatedUser = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(authType: typeof Constant.GUEST_USER | typeof Constant.AUTH_USER, user: any) => {
			const authUser: AuthContextProvider = {
				authType: authType,
				authenticatedUser: {
					id: 0,
					fullname: "",
					username: "",
					email: "",
					roles: [],
				},
			};
			if (authType === Constant.AUTH_USER) {
				authUser.authenticatedUser.id = user.id;
				authUser.authenticatedUser.fullname = user.fullname;
				authUser.authenticatedUser.username = user.username;
				authUser.authenticatedUser.email = user.email;
				authUser.authenticatedUser.roles = user.roles;
			}

			setAuthLocale(authType);
			setAuthenticatedUser(authUser);

			// Firebase Analytics: Kullanıcı tipini (Guest/User) segment olarak belirle
			isSupported().then((supported) => {
				if (supported) {
					const analytics = getAnalytics();
					setUserProperties(analytics, { user_type: authType });
				}
			});
		},
		[setAuthLocale, setAuthenticatedUser],
	);

	const setAuthLevel = useCallback(() => {
		if (game.isLoading) {
			buildAuthenticatedUser(Constant.GUEST_USER, []);
			props.setGameLoading(false);
		}
	}, [buildAuthenticatedUser, game.isLoading, props]);

	const initialize = useCallback(async () => {
		console.debug(
			"%c  NOTE QUIZZ  ",
			"background: #1d2673d8; color: white; padding: 8px 15px; border-radius: 4px; font-size: 2.5em; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); line-height: 1.2;",
		);
		logger.group("APP");
		logger.debug("App starting...");
		await Initializer.getInstance().initialize();
		setAuthLevel();
		logger.groupEnd();
	}, [setAuthLevel, logger]);

	useEffect(() => {
		if (!isInitializationStarted.current) {
			initialize();
			isInitializationStarted.current = true;
		}
	}, [initialize]);

	useEffect(() => {
		if (!componentsInit && content.isInit && game.isInit && !content.isLoading && !game.isLoading) {
			setComponentsInit(content.isFingerPrintInited && content.isFontLoaded && content.isMusicLoaded && content.isVideoLoaded);
		}
	}, [content, game, componentsInit]);

	return componentsInit ? (
		<HelmetProvider>
			<AuthContext.Provider value={authenticatedUser!}>
				<HeroUIProvider navigate={navigate}>
					<Router auth={authLocale} />
				</HeroUIProvider>
			</AuthContext.Provider>
		</HelmetProvider>
	) : (
		<Loading />
	);
};

const connector = connect(null, {
	setGameLoading,
	setVideoLoading,
	setVideoContent,
	setMusicLoading,
	setSoundLoading,
});

type PropsFromRedux = ConnectedProps<typeof connector>;
const ConnectedApp = connector(App);

const AppBuilder = () => {
	return (
		<Provider store={store}>
			<React.StrictMode>
				<BrowserRouter>
					<ConnectedApp />
				</BrowserRouter>
			</React.StrictMode>
		</Provider>
	);
};

ReactDOM.createRoot(document.getElementById("root")!).render(<AppBuilder />);
