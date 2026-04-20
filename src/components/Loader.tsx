import { FC, useEffect, useState } from "react";
import Box from "./Box";
import Flex, { FlexType } from "./Flex";
import { Constant } from "../constants/Constant";
import { Progress } from "@heroui/react";

interface ILoader {
    initDegree: number
    currentDegree: number
    loaderFinishEvent: (value: boolean) => void
}

const Loader: FC<ILoader> = ({ ...props }: ILoader) => {
    const [degree, setDegree] = useState<number>(props.initDegree);
    const [loadingBarCompleted, setloadingBarCompleted] = useState<boolean>(false);
    const [continueButtonClicked, setContinueButtonClicked] = useState<boolean>(false);

    useEffect(() => {
        setDegree(props.currentDegree);
    }, [props.currentDegree])


    const onLoadingAnimEnd = () => {
        const inter = setInterval(() => {
            if (degree >= 100) setloadingBarCompleted(true);
            clearInterval(inter);
        }, 400);
    }

    const continueButtonClick = () => {
        const inter = setInterval(() => {
            clearInterval(inter);
            props.loaderFinishEvent(true);
        }, 250);
        setContinueButtonClicked(true);
    }

    return (
        <>
            <Box className={"transition fade-in-out delay-150 duration-300 bg-black min-w-full " + (!continueButtonClicked ? "opacity-100 " : "opacity-0 ") + (!loadingBarCompleted ? "opacity-100" : "hover:cursor-pointer")} size={'sm'} mxAuto={true} onClick={() => continueButtonClick()}>
                <Flex align={'center'} justify={'center'} className={'h-screen'}>
                    <FlexType flexType='flex-initial'>
                        <Box className={'pulse-anim-cont'}>
                            <div className='pulse-anim loading-background' />
                            <div className='pulse-anim loading-text'>{Constant.APP_NAME}</div>
                        </Box>
                        {loadingBarCompleted ?
                            <Flex align={'center'} justify={'center'}><p className="text-white justify-center items-center text-2xl">Click To Continue</p></Flex> :
                            <Box className={"transition fade-in-out delay-150 duration-300 " + (!loadingBarCompleted ? "opacity-100" : "opacity-0")}>
                                <Progress color='primary' value={degree} onTransitionEnd={() => onLoadingAnimEnd()} />
                            </Box>
                        }
                    </FlexType>
                </Flex>
            </Box>
        </>
    );
}

export default Loader;