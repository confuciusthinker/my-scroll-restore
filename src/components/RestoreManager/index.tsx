import React from 'react';
import { tryMutilTimes } from '../../utils';
import { ScrollRestoreManagerProps, ScrollManager } from './index.d';

const noop = (...args: any[]) => {};
export const ScrollManagerContext = React.createContext<ScrollManager>({
    setMatch: noop,
    setLocation: noop,
    registerOrUpdateNode: noop,
    restoreLocation: noop,
    unRegisterNode: noop,
});

/**
 * 滚动的管理者
 * 1. 设置原始滚动位置，恢复和保存原始节点；
 * 2. 通过context将该对象分发给具体的滚动恢复执行者；
 */
const ScrollRestoreManager = (props: ScrollRestoreManagerProps) => {
    //确保获取元素导航切换前的位置监听函数一定先于React Router的监听函数
    const [shouldChild, setShouldChild] = React.useState(false);

    //注册缓存的内容
    const locationCache = React.useRef<{
        [key: string]: { x: number; y: number };
    }>({});
    const nodeCache = React.useRef<{
        [key: string]: HTMLElement | null;
    }>({});
    const matchCache = React.useRef<{
        [key: string]: boolean;
    }>({});
    const cancelRestoreFnCache = React.useRef<{
        [key: string]: () => void;
    }>({});

    const manager: ScrollManager = {
        registerOrUpdateNode(key, node) {
            nodeCache.current[key] = node;
        },
        unRegisterNode(key) {
            nodeCache.current[key] = null;
            //及时清除
            cancelRestoreFnCache.current[key] && cancelRestoreFnCache.current[key]();
        },
        setMatch(key, matched) {
            matchCache.current[key] = matched;
            if (!matched) {
                //及时清除
                cancelRestoreFnCache.current[key] && cancelRestoreFnCache.current[key]();
            }
        },
        setLocation(key, node) {
            if (!node) return;
            locationCache.current[key] = { x: node?.scrollLeft || 0, y: node?.scrollTop || 0 };
        },
        restoreLocation(key) {
            if (!locationCache.current[key]) return;
            const { x, y } = locationCache.current[key];
            //多次尝试机制
            let shouldNextTick = true;
            cancelRestoreFnCache.current[key] = tryMutilTimes(
                () => {
                    if (shouldNextTick && nodeCache.current[key]) {
                        nodeCache.current[key]!.scrollLeft = x;
                        nodeCache.current[key]!.scrollTop = y;
                        //如果恢复成功，就取消
                        if (nodeCache.current[key]!.scrollLeft === x && nodeCache.current[key]!.scrollTop === y) {
                            shouldNextTick = false;
                            cancelRestoreFnCache.current[key]();
                        }
                    }
                },
                props.restoreInterval || 50,
                props.tryRestoreTimeout || 500
            );
        },
    };

    //为了确保shouldChild在Router渲染前设置，使用useLayoutEffect(同步)
    React.useLayoutEffect(() => {
        //利用history提供的listen监听能力
        const unlisten = props.history.listen(() => {
            const cacheNodes = Object.entries(nodeCache.current);
            cacheNodes.forEach((entry) => {
                const [key, node] = entry;
                //如果matchCache为true，表明从当前的match（路由渲染的页面离开）,所以离开之前，保存scroll
                if (matchCache.current[key]) {
                    manager.setLocation(key, node);
                }
            });
        });

        //确保该监听先入栈，也就是监听完上述回调函数后才实例化Router
        setShouldChild(true);

        return () => {
            locationCache.current = {};
            nodeCache.current = {};
            matchCache.current = {};
            cancelRestoreFnCache.current = {};
            Object.values(cancelRestoreFnCache.current).forEach((cancel) => cancel && cancel());
            unlisten();
        };
    }, []);

    return (
        <ScrollManagerContext.Provider value={manager}>{shouldChild && props.children}</ScrollManagerContext.Provider>
    );
}

export default ScrollRestoreManager;