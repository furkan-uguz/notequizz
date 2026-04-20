import React, { FC, useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ConnectedProps, Provider, connect, useSelector } from 'react-redux';
import { IAddOptions, Loader } from 'resource-loader';
import { initializeApp } from "firebase/app";
import { getPerformance } from "firebase/performance";
import { getAnalytics, isSupported, setUserId, setUserProperties } from "firebase/analytics";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import WebFont from 'webfontloader';
import Router from './router';
import AuthContext, { AuthContextProvider } from './contexts/AuthContext';
import store from './states';
import { StateType } from './states/reducers';
import { setGameLoading } from './states/actions/gameAction';
import { setFingerprintInitStatus, setVideoLoading, setFontLoading, setVideoContent, setMusicLoading, setSoundLoading } from './states/actions/contentAction';
import { ContentList } from './constants/ContentList';
import { Constant } from './constants/Constant';
import Loading from './pages/Loading';
import { HeroUIProvider } from '@heroui/react';
import { initSounds, initBackgroundMusic } from './lib/Sound';
import usePageView from './hooks/useAnalytics';

const firebaseConfig = {
  apiKey: "AIzaSyDdqrgLCiptUGxqpC4j5VuC5nk9zlwQGhA",
  authDomain: "notequizz.firebaseapp.com",
  databaseURL: "https://notequizz-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "notequizz",
  storageBucket: "notequizz.appspot.com",
  messagingSenderId: "28432330911",
  appId: "1:28432330911:web:a73a5360f225f2d11e72aa",
  measurementId: "G-WRTE5ZY5ZC",
};

// Firebase'i modül seviyesinde başlatmak, hook'ların güvenle çalışmasını sağlar.
const app = initializeApp(firebaseConfig);
getPerformance(app);
isSupported().then((supported) => supported && getAnalytics(app));

const App: FC<PropsFromRedux> = (props): JSX.Element => {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthContextProvider>();
  const [authLocale, setAuthLocale] = useState(Constant.GUEST_USER);
  const [componentsInit, setComponentsInit] = useState(false);
  const content = useSelector((state: StateType) => state.content);
  const game = useSelector((state: StateType) => state.game);
  const navigate = useNavigate();
  const isInitialized = useRef(false);

  // Otomatik sayfa takibini başlat
  usePageView();
  
  useEffect(() => {
    if (!isInitialized.current) {
      initialize();
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (content.isInit && game.isInit)
      handleLoading();

  }, [content, game]);

  const initialize = () => {
    console.log("Initialization started");
    initFingerPrint();
    setAuthLevel();
    loadFonts();
    loadVideoContent();
    loadMusics();
    loadSounds();
  }

  const handleLoading = () => {
    if (!componentsInit && !content.isLoading && !game.isLoading) {// Add here authorization flag
      if (content.isFingerPrintInited && content.isFontLoaded && content.isMusicLoaded && content.isVideoLoaded) {
        setComponentsInit(true);
        console.log("Components ready!");
      }
    }
  }

  const setAuthLevel = () => {
    if (game.isLoading) {
      buildAuthenticatedUser(Constant.GUEST_USER, []);
      props.setGameLoading(false);
    }
  }

  const loadFonts = () => {
    if (!content.isFontLoaded) {
      WebFont.load({
        custom: {
          families: ['Niconne-Regular'],
          urls: ['./css/index.css']
        },
        active: () => {
          props.setFontLoading(true);
        }
      });
    }
  }

  const loadVideoContent = () => {
    if (!content.isVideoLoaded) {
      const options: IAddOptions = {
        baseUrl:ContentList.CLOUDINARY_URL,
        url: ContentList.BG_VIDEO_SRC,
        crossOrigin: 'anonymous',
        loadType: 2,
        xhrType: 'blob',
      };
      
      const videoLoader = new Loader();
      videoLoader.use((resource, next) => {
        // Eğer iOS mime-type'ı boş bırakırsa manuel ata
        if (resource.data instanceof Blob && !resource.data.type) {
          resource.data = resource.data.slice(0, resource.data.size, 'video/mp4');
        }
        next();
      });

      videoLoader.add(options).load((_loader, resource) => {
        props.setVideoContent(resource[ContentList.BG_VIDEO_SRC]?.data);
        props.setVideoLoading(true);
      });
    }
  }

  const loadMusics = () => {
    if (!content.isMusicLoaded) {
      initBackgroundMusic().then(() => {
        console.log("Music loaded via Tone.js");
        props.setMusicLoading(true);
      });
    }
  }

 const loadSounds = () => {
    if(!content.isSoundsLoaded) {
      initSounds().then(() => {
        console.log("Sounds loaded");
        props.setSoundLoading(true);
      });
    }
  }

  const initFingerPrint = () => {
    if (!content.isFingerPrintInited) {
      const fpPromise = FingerprintJS.load();
      (async () => {
        const fp = await fpPromise;
        const result = await fp.get();
        localStorage.setItem(import.meta.env.VITE_REACT_APP_FINGERPRINT_NAME!, result.visitorId);
        
        // Firebase Analytics: Kullanıcı kimliğini tanımla
        isSupported().then((supported) => {
            if (supported) {
                const analytics = getAnalytics();
                setUserId(analytics, result.visitorId);
            }
        });
      })();
      props.setFingerprintInitStatus(true);
    }
  }

  const buildAuthenticatedUser = (authType: string, user: any) => {
    const authUser: AuthContextProvider = {
      authType: authType,
      authenticatedUser: {
        id: 0,
        fullname: "",
        username: "",
        email: "",
        roles: []
      }
    }
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
  }

  return (!componentsInit ? <><Loading /></> :
    <>
      <HelmetProvider>
        <AuthContext.Provider value={authenticatedUser!}>
          <HeroUIProvider navigate={navigate}>
            <Router auth={authLocale} />
          </HeroUIProvider>
        </AuthContext.Provider>
      </HelmetProvider>
    </>
  );
}

const connector = connect(null, {
  setGameLoading,
  setVideoLoading,
  setFontLoading,
  setFingerprintInitStatus,
  setVideoContent,
  setMusicLoading,
  setSoundLoading
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
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AppBuilder />);