import React from 'react';

export interface ScrollRestoreElementProps {
    /**
     * 必须缓存的key，用来标志缓存的具体元素，位置信息以及状态等，全局唯一
     */
    scrollKey: string;
    children?: React.ReactElement;
    /**
     * 为true时触发滚动恢复
     */
    when?: boolean;
    /**
     * 外部传入ref
     * @returns
     */
    getRef?: () => HTMLElement;
}
