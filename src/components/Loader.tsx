import { FC, useEffect, useState } from "react";
import Box from "./Box";
import Flex, { FlexType } from "./Flex";
import Const from "../utils/Const";
import { Progress } from "@heroui/react";

interface ILoader {
    initDegree: number
    currentDegree: number
    loaderFinishEvent: Function
}

const Loader: FC<ILoader> = ({ ...props }: ILoader) => {
    const [degree, setDegree] = useState<number>(props.initDegree);
    const [loadingBarCompleted, setloadingBarCompleted] = useState<boolean>(false);

    useEffect(() => {
        setDegree(props.currentDegree);
    }, [props.currentDegree])
    

    const onLoadingAnimEnd = () => {
        const inter = setInterval(() => {
            if (degree >= 100) setloadingBarCompleted(true);
            clearInterval(inter);
        }, 250);
    }

    const onAnimEnd = () => {
        const inter = setInterval(() => {
            clearInterval(inter);
            props.loaderFinishEvent(true);
        }, 250);
    }

    return (
        <>
            <Box className={"transition fade-in-out delay-150 duration-300 bg-black min-w-full " + (!loadingBarCompleted ? "opacity-100" : "opacity-0")} size={'sm'} mxAuto={true} onTransitionEnd={() => onAnimEnd()}>
                <Flex align={'center'} justify={'center'} className={'h-screen'}>
                    <FlexType flexType='flex-initial'>
                        <Box className={'pulse-anim-cont'}>
                            <div className='pulse-anim loading-background' />
                            <div className='pulse-anim loading-text'>{Const.APP_NAME}</div>
                        </Box>
                        <Box>
                            <Progress color='primary' value={degree} onTransitionEnd={() => onLoadingAnimEnd()} />
                        </Box>
                    </FlexType>
                </Flex>
            </Box>
        </>
    );
}

export default Loader;