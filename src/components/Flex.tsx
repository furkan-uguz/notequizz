import { FC } from "react";

interface IFlexInterface extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    mxAuto?: boolean;
    direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
    flexType?: 'flex-1' | 'flex-auto' | 'flex-initial' | 'flex-none';
    align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    justify?: 'normal' | 'start' | 'end' | 'center' | 'stretch' | 'between' | 'around' | 'evenly';
    className?: string;
}

const flexDirections = {
    'row' : ' flex-row',
    'row-reverse' : ' flex-row-reverse',
    'col' : ' flex-col',
    'col-reverse' : ' flex-col-reverse',
}

const flexTypes = {
    'flex-1': 'flex-1',
    'flex-auto': 'flex-auto',
    'flex-initial': 'flex-initial',
    'flex-none': 'flex-none'
}

const alignTypes = {
    'start': ' items-start',
    'end': ' items-end',
    'center': ' items-center',
    'baseline': ' items-baseline',
    'stretch': ' items-strech'
}

const justifyTypes = {
    'normal': ' justify-normal',
    'start': ' justify-start',
    'end': ' justify-end',
    'center': ' justify-center',
    'between': ' justify-between',
    'around': ' justify-around',
    'evenly': ' justify-evenly',
    'stretch': ' justify-strech'
}

export const FlexType: FC<IFlexInterface> = (props: IFlexInterface) => {
    let mxAuto = props.mxAuto ? ' mx-auto' : '';
    let flexType = props.flexType !== undefined ? flexTypes[props.flexType] : 'flex-1';
    let flexDirection = props.direction !== undefined ? flexDirections[props.direction] : '';
    let align = props.align !== undefined ? alignTypes[props.align] : '';
    let justify = props.justify !== undefined ? justifyTypes[props.justify] : '';
    let classN = props.className !== undefined ? ' ' + props.className : '';
    let clazz = flexType + flexDirection + align + justify + mxAuto + classN;

    return (
        <div className={clazz}>
            {props.children}
        </div>
    )
}

const Flex: FC<IFlexInterface> = (props: IFlexInterface) => {
    let mxAuto = props.mxAuto ? ' mx-auto' : '';
    let flexDirection = props.direction !== undefined ? flexDirections[props.direction] : '';
    let align = props.align !== undefined ? alignTypes[props.align] : '';
    let justify = props.justify !== undefined ? justifyTypes[props.justify] : '';
    let classN = props.className !== undefined ? ' ' + props.className : '';
    let clazz = 'flex' + flexDirection + align + justify + mxAuto + classN;

    return (
        <div className={clazz}>
            {props.children}
        </div>
    );
};

export default Flex;