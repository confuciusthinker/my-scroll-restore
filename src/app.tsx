import React, { useState } from "react";
import { Link, Route, RouteChildrenProps, RouteComponentProps, Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import ScrollRestoreElement from "./components/RestoreElement";
import ScrollRestoreManager from "./components/RestoreManager";

const history = createBrowserHistory();

const LongListV1 = (props: RouteComponentProps) => {
    const [data, setData] = useState(0);
    const bigArray = Array.from({ length: data }).map((v, k) => k);
    setTimeout(() => {
        setData(2000);
    }, 1500);
    
    return (
        <>
            <div>
                长列表1 渲染后 拉取数据（1.5s数据返回）
            </div>
            {
                bigArray.length === 0 ? <div>loading...</div> : (
                    <ScrollRestoreElement
                        when={bigArray.length > 0}
                        scrollKey="渲染后拉取数据"
                    >
                        <ul style={{ maxHeight: 400, overflow: "auto" }}>
                            {bigArray.map(i => {
                                return (
                                    <div style={{ margin: 10 }} key={i}>
                                        <span
                                            style={{ margin: 10 }}
                                            onClick={() => {
                                                props.history.push("/detail");
                                            }}
                                        >
                                            {i}--点我导航到detail
                                        </span>
                                    </div>
                                );
                            })}
                        </ul>
                    </ScrollRestoreElement>
                )
            }
        </>
    );
};

const LongListV2 = (props: RouteChildrenProps) => {
    const bigArray = Array.from({ length: 1000 }).map((v, k) => k);
    return (
        <>
            <div>
                长列表2 外层display:none不销毁 内部组件列表销毁重建（ul的key变化）
            </div>
            {
                <ScrollRestoreElement
                    when={bigArray.length > 0}
                    scrollKey="我下面的ul要保存住滚动位置,即便key会变(remount)"
                >
                    <ul
                        key={Math.random() /* 列表销毁重建！ */}
                        style={{ maxHeight: 400, overflow: "auto" }}
                    >
                    {
                        bigArray.map(i => {
                            return (
                                <div style={{ marginBottom: 10 }} key={i}>
                                    <span
                                        onClick={() => {
                                            props.history.push("/detail");
                                        }}
                                    >
                                        {i}--点我导航到detail
                                    </span>
                                </div>
                            );
                        })
                    }
                    </ul>
                </ScrollRestoreElement>
            }
        </>
    );
}

const Detail = (props: RouteComponentProps) => {
    return (
        <div>
            detail
            <button onClick={() => props.history.goBack()}>返回（或者左上角）</button>
        </div>
    );
};

const Nav = () => {
    return (
        <>
            <Link to="/list1">长列表1</Link>
            <Link to="/list2">长列表2</Link>
            <Link to="/detail">详情</Link>
        </>
    );
};

const App = () => {
    return (
        <ScrollRestoreManager history={history}>
            <Router history={history}>
                <Nav />
                <Route exact path="/list1" component={LongListV1} />
                <Route exact path="/list2" children={(props: RouteChildrenProps) => (
                    <div style={{ display: props.match?.isExact ? 'block' : 'none' }}>
                        <LongListV2 {...props} />
                    </div>
                )} />
                <Route exact path="/detail" component={Detail} />
            </Router>
        </ScrollRestoreManager>
    );
};

export default App;