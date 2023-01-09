import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { match, __RouterContext as RouterContext } from 'react-router';
import { ScrollManagerContext } from '../RestoreManager';
import { ScrollManager } from '../RestoreManager/index.d';
import { ScrollRestoreElementProps } from './index.d';

/**
 * 滚动恢复的执行者（本质上是一个代理，拿到子元素的控制权）
 * 1. 决定缓存的key
 * 2. 决定何时触发恢复
 * 3. 决定何时保存原始HTMLElement引用
 * 4. 设置是否需要保存位置的标志
 */
export default function ScrollRestoreElement(props: ScrollRestoreElementProps) {
    const nodeRef = useRef<HTMLElement>();
    const manager: ScrollManager = useContext<ScrollManager>(ScrollManagerContext);
    const currentMatch = useContext(RouterContext).match;
    const previewMatchRef = useRef<match | null>(null);

    useEffect(() => {
        const handler = function (event: Event) {
            if (nodeRef.current === event.target) {
                manager.setLocation(props.scrollKey, nodeRef.current);
            }
        };

        //在window上监听scroll事件，获取scroll事件触发target，并更新位置
        window.addEventListener('scroll', handler, true);
        return () => window.removeEventListener('scroll', handler, true);
    }, [props.scrollKey]);

    //同步处理DOM，防止闪动
    useLayoutEffect(() => {
        if (props.getRef) {
            //获取ref
            nodeRef.current = props.getRef();
        }

        if (currentMatch) {
            //设置标志，表明当location改变时，可以保存滚动位置
            manager.setMatch(props.scrollKey, true);
            //更新ref，代理的DOM可能会发生变化（比如key发生了变化，remount元素）
            nodeRef.current && manager.registerOrUpdateNode(props.scrollKey, nodeRef.current);
            //恢复原先滑动过的位置，可通过外部props通知是否需要进行恢复
            (props.when === undefined || props.when) && manager.restoreLocation(props.scrollKey);
        } else {
            //未命中标志设置，不要保存滚动位置
            manager.setMatch(props.scrollKey, false);
        }

        previewMatchRef.current = currentMatch;
        //每次update注销，并重新注册最新的nodeRef
        return () => manager.unRegisterNode(props.scrollKey);
    });

    if (props.getRef) {
        return props.children as JSX.Element;
    }

    const onlyOneChild = React.Children.only(props.children);
    if (onlyOneChild && onlyOneChild.type && typeof onlyOneChild.type === 'string') {
        return React.cloneElement(onlyOneChild, { ref: nodeRef });
    } else {
        console.warn('-----滚动恢复失败，ScrollElement的children必须为单个html标签');
    }

    return props.children as JSX.Element;
}
