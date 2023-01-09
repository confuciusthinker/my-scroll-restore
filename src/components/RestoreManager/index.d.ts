import React from 'react';
import { History } from 'history';

export interface ScrollManager {
    /**
     * 保存当前的真实DOM节点
     * @param key 缓存的索引
     * @param node
     * @returns
     */
    registerOrUpdateNode: (key: string, node: HTMLElement) => void;
    /**
     * 设置当前的真实DOM节点的元素位置
     * @param key 缓存的索引
     * @param node
     * @returns
     */
    setLocation: (key: string, node: HTMLElement | null) => void;
    /**
     * 设置标志，表明location改变时，是可以保存滚动位置的
     * @param key 缓存的索引
     * @param matched
     * @returns
     */
    setMatch: (key: string, matched: boolean) => void;
    /**
     * 恢复位置
     * @param key 缓存的索引
     * @returns
     */
    restoreLocation: (key: string) => void;
    /**
     * 清空节点的缓存
     * @param key
     * @returns
     */
    unRegisterNode: (key: string) => void;
}

export interface ScrollRestoreManagerProps {
    history: History;
    children: React.ReactNode;
    //重试的时间间隔
    restoreInterval?: number;
    //重试的超时时间
    tryRestoreTimeout?: number;
}

