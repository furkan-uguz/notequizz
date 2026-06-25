import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { FirebaseApp, initializeApp } from "firebase/app";
import { getPerformance } from "firebase/performance";
import { getAnalytics, isSupported, setUserId } from "firebase/analytics";
import WebFont from "webfontloader";
import { Loader, ResourceType } from "resource-loader";

import store from "../states";
import { ContentState } from "../states/reducers/contentReducer";
import { setFingerprintInitStatus, setFirebaseInitStatus, setFontLoading, setMusicLoading, setSoundLoading, setVideoContent, setVideoLoading } from "../states/actions/contentAction";
import { ChalkLogger } from "../utils/ChalkLogger";
import { initBackgroundMusic, initSounds } from "../lib/Sound";
import { ContentList } from "../constants/ContentList";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export class Initializer {
	private static instance: Initializer;

	private readonly mainLogger: ChalkLogger;
	private readonly firebaseLogger: ChalkLogger;
	private readonly fingerprintLogger: ChalkLogger;
	private readonly fontLogger: ChalkLogger;
	private readonly videoLogger: ChalkLogger;
	private readonly musicLogger: ChalkLogger;
	private readonly soundLogger: ChalkLogger;
	private readonly content: ContentState = store.getState().content;

	private constructor() {
		this.mainLogger = new ChalkLogger("#00155cff", "Main");
		this.firebaseLogger = new ChalkLogger("#FF0000", "Firebase");
		this.fingerprintLogger = new ChalkLogger("#FFFF00", "Fingerprint");
		this.fontLogger = new ChalkLogger("#FF00FF", "Font");
		this.videoLogger = new ChalkLogger("#00FF00", "Video");
		this.musicLogger = new ChalkLogger("#0000FF", "Music");
		this.soundLogger = new ChalkLogger("#00FFFF", "Sound");
	}

	public static getInstance() {
		if (!Initializer.instance) {
			Initializer.instance = new Initializer();
		}

		return Initializer.instance;
	}

	public async initialize(): Promise<void> {
		this.mainLogger.group("INITIALIZATION");
		await this.initFirebase();
		await this.initFingerprint();
		await this.initFonts();
		await this.initBackgroundMusic();
		await this.initSounds();
		await this.initVideoContent();
		this.mainLogger.groupEnd();
	}

	public async initFirebase(): Promise<void> {
		this.firebaseLogger.group("Initialization");
		this.firebaseLogger.debug("Initialization started...");

		if (!firebaseConfig.projectId && import.meta.env.PROD) {
			this.firebaseLogger.error("Firebase Project ID is missing! Please check your Environment Variables.");
			this.firebaseLogger.groupEnd();
			return;
		}

		if (this.content.isFirebaseInited) {
			this.firebaseLogger.debug("Firebase already initialized. Skipping.");
		} else {
			const app: FirebaseApp = initializeApp(firebaseConfig);
			getPerformance(app);
			isSupported().then((supported) => supported && getAnalytics(app) && store.dispatch(setFirebaseInitStatus(true)));
		}

		this.firebaseLogger.debug("Initialization completed.");
		this.firebaseLogger.groupEnd();
	}

	public async initFingerprint(): Promise<void> {
		this.fingerprintLogger.group("Initialization");
		this.fingerprintLogger.debug("Initialization started...");

		if (this.content.isFingerPrintInited) {
			this.fingerprintLogger.info("FingerprintJS already initialized. Skipping.");
		} else {
			try {
				const fp = await FingerprintJS.load();
				const result = await fp.get();
				const visitorId = result.visitorId;

				localStorage.setItem(import.meta.env.VITE_REACT_APP_FINGERPRINT_NAME, visitorId);
				this.fingerprintLogger.debug("Fingerprint acquired. ID: %s", visitorId);
				store.dispatch(setFingerprintInitStatus(true));

				if (await isSupported()) {
					setUserId(getAnalytics(), visitorId);
				}
			} catch (error) {
				this.fingerprintLogger.error("FingerprintJS initialization failed: %o", error);
			}
		}

		this.fingerprintLogger.debug("Initialization completed.");
		this.fingerprintLogger.groupEnd();
	}

	public async initFonts(): Promise<void> {
		this.fontLogger.group("Initialization");
		this.fontLogger.debug("Initialization started...");

		if (this.content.isFontLoaded) {
			this.fontLogger.info("Font already initialized. Skipping.");
		} else {
			WebFont.load({
				custom: {
					families: ["Niconne-Regular"],
					urls: ["./css/index.css"],
				},
				loading: () => {
					this.fontLogger.debug("Niconne-Regular fonts loading...");
				},
				active: () => {
					this.fontLogger.debug("Niconne-Regular fonts loaded.");
					store.dispatch(setFontLoading(true));
				},
			});
		}

		this.fontLogger.debug("Initialization completed.");
		this.fontLogger.groupEnd();
	}

	public async initBackgroundMusic(): Promise<void> {
		this.musicLogger.group("Initialization");
		this.musicLogger.debug("Initialization started...");

		if (this.content.isMusicLoaded) {
			this.musicLogger.info("Background music already initialized. Skipping.");
		} else {
			await initBackgroundMusic();
			this.musicLogger.debug("Background music loaded.");
			store.dispatch(setMusicLoading(true));
		}

		this.musicLogger.debug("Initialization completed.");
		this.musicLogger.groupEnd();
	}

	public async initSounds(): Promise<void> {
		this.soundLogger.group("Initialization");
		this.soundLogger.debug("Initialization started...");

		if (this.content.isSoundsLoaded) {
			this.soundLogger.info("Sounds already initialized. Skipping.");
		} else {
			await initSounds();
			this.soundLogger.debug("Sounds loaded.");
			store.dispatch(setSoundLoading(true));
		}

		this.soundLogger.debug("Initialization completed.");
		this.soundLogger.groupEnd();
	}

	public async initVideoContent(): Promise<void> {
		this.videoLogger.group("Initialization");
		this.videoLogger.debug("Initialization started...");

		if (this.content.isVideoLoaded) {
			this.videoLogger.info("Background video already initialized. Skipping.");
		} else {
			const videoLoader = new Loader();
			videoLoader.add({
				baseUrl: ContentList.CLOUDINARY_URL,
				url: ContentList.BG_VIDEO_SRC,
				crossOrigin: "anonymous",
				loadType: ResourceType.Blob,
				xhrType: "blob",
			});

			videoLoader.onProgress.add((_loader, resource) => {
				this.videoLogger.debug("Background video loading... %s", resource.name);
			});

			videoLoader.onComplete.add(() => {
				this.videoLogger.debug("Background video loaded.");
				store.dispatch(setVideoContent(videoLoader.resources[ContentList.BG_VIDEO_SRC]?.data));
				store.dispatch(setVideoLoading(true));
			});

			videoLoader.load();
		}

		this.videoLogger.debug("Initialization completed.");
		this.videoLogger.groupEnd();
	}
}
