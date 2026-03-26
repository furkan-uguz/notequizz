import { FC, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import Loader from "../components/Loader";
import { StateType } from "../states/reducers";
import { setLoading, setLoadingBar } from "../states/actions/contentActions";
import { ConnectedProps } from "react-redux";

const Loading: FC<PropsFromRedux> = (props): JSX.Element => {
    const content = useSelector((state: StateType) => state.content);

    useEffect(() => {
        calculate();
    }, [content.isFontLoaded, content.isFingerPrintInited, content.isVideoLoaded]);

    const calculate = () => {
        const contentList: string[] = [
            'isFontLoaded',
            'isFingerPrintInited',
            'isVideoLoaded',
            'isMusicLoaded'
        ]
        const progressVal = 100 / contentList.length;
        const contentEntries = Object.entries(content);
        let newProgressVal: number = 0;
        for (const cont of contentList) {
            const isLoad = contentEntries.find((v) => { return v.find((v1) => { return cont === v1 }); });
            newProgressVal += isLoad![1] === true ? progressVal : 0;
        }

        props.setLoadingBar(newProgressVal < 100 ? newProgressVal : 100);
    }

    const loaderFinishCallback = (state: boolean) => {
        if (state)
            props.setLoading(false);
    }

    return (
        <>
            <Loader initDegree={0} currentDegree={content.loadingBar} loaderFinishEvent={loaderFinishCallback}></Loader>
        </>
    );
}

const connector = connect(null, {
    setLoadingBar,
    setLoading
});

type PropsFromRedux = ConnectedProps<typeof connector>;
const ConnectedLoading = connector(Loading);

export default ConnectedLoading;
