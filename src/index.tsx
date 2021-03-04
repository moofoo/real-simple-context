import React, { Dispatch } from 'react';
import {
    createContext,
    useContextSelection,
    isEqualShallow,
} from 'use-context-selection';

type Obj = {
    [index: string]: any;
};

interface Action extends Obj {
    type: string;
}

export type Reducer<S extends Obj> = (state: S, action: Action) => S;

export type DispatchAction = Dispatch<Action>;

type Actions<Type extends Obj> = {
    [Property in keyof Type]: ReturnType<Type[Property]>;
};

type Optional<Type> = {
    [Property in keyof Type]?: Type[Property];
};

export function createReducerContext<S, A>(
    reducer: Reducer<S>,
    actions: A,
    initialState: S,
    referenceContext: boolean = false,
    equalityTest: (a: any, b: any) => boolean = isEqualShallow
) {
    const ActionContext = React.createContext({});
    const StateContext = createContext({}, equalityTest);
    const ReferenceContext = React.createContext({});

    const useReference = () => {
        return React.useContext(ReferenceContext) as { current: any };
    };

    const useActions = () => {
        return React.useContext(ActionContext) as Actions<A>;
    };

    const useSelector = (selector: (state: S) => any): any => {
        return useContextSelection(StateContext, selector);
    };

    const Provider = ({
        children,
        initState,
        initRefState,
    }: {
        children: React.ReactNode;
        initState?: Optional<S>;
        initRefState?: Optional<S>;
    }) => {
        const [state, dispatch] = React.useReducer(reducer, {
            ...initialState,
            ...(initState || {}),
        });

        const boundActions = useBoundActions(actions, dispatch);

        const reference = React.useRef(initRefState || {});

        if (referenceContext) {
            return (
                <ReferenceContext.Provider value={reference}>
                    <ActionContext.Provider value={boundActions}>
                        <StateContext.Provider value={state}>
                            {children}
                        </StateContext.Provider>
                    </ActionContext.Provider>
                </ReferenceContext.Provider>
            );
        }

        return (
            <ActionContext.Provider value={boundActions}>
                <StateContext.Provider value={state}>
                    {children}
                </StateContext.Provider>
            </ActionContext.Provider>
        );
    };

    if (referenceContext) {
        return { Provider, useActions, useSelector, useReference };
    }

    return { Provider, useActions, useSelector };
}

function useBoundActions(actions: any, dispatch: DispatchAction) {
    return React.useMemo(() => {
        return Object.keys(actions).reduce((accumulator, key) => {
            return {
                ...accumulator,
                [key]: actions[key](dispatch),
            };
        }, {});
    }, [actions, dispatch]);
}
