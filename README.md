# Real Simple Context

- Quick and easy reducer-based context setup
- Isolate component updates to specific slices of state with selectors (uses [use-context-selection](https://www.npmjs.com/package/use-context-selection))

## Install

```bash
yarn add real-simple-context
```

## Table of Contents

1. [Example](#example)
2. [createReducerContext](#createreducercontext)
3. [referenceContext param](#referencecontext-param)
4. [equalityTest param](#equalitytest-param)
5. [Reducer and initialState with vanilla JS](#reducer-and-initialstate-with-vanilla-js)
6. [Typescript](#typescript)

## Example

[CODESANDBOX](https://codesandbox.io/s/real-simple-context-tjglt)

context.js (createReducerContext)

```javascript
import { createReducerContext } from 'real-simple-context';

const initialState = { counter: 0, totalIncrements: 0, totalDecrements: 0 };

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_COUNTER_VALUE': {
      return {
        ...state,
        counter: action.value,
      };
    }
    case 'INCREMENT': {
      return {
        ...state,
        counter: state.counter + 1,
        totalIncrements: state.totalIncrements + 1,
      };
    }
    case 'DECREMENT': {
      return {
        ...state,
        counter: state.counter - 1,
        totalDecrements: state.totalDecrements + 1,
      };
    }
    default: {
      return state;
    }
  }
};

const setCounterValue = (dispatch) => (value) => {
  dispatch({
    type: 'SET_COUNTER_VALUE',
    value,
  });
};

const increment = (dispatch) => () => {
  dispatch({
    type: 'INCREMENT',
  });
};

const decrement = (dispatch) => () => {
  dispatch({
    type: 'DECREMENT',
  });
};

const actions = { setCounterValue, increment, decrement };

export const { Provider, useSelector, useActions } = createReducerContext(
  reducer,
  actions,
  initialState
);
```

index.js (Provider)

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from './context';

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

Display.js (useSelector)

```javascript
import React from 'react';
import { useSelector } from './context';

const Display = ({ stateKey }) => {
  const value = useSelector((state) => state[stateKey]);

  return (
    <div className='display'>
      {stateKey}: {value}
    </div>
  );
};

export default Display;
```

Buttons.js (useActions)

```javascript
import React from 'react';
import { useActions } from './context';

const Buttons = () => {
  const { setCounterValue, increment, decrement } = useActions();

  return (
    <div>
      <button type='button' onClick={decrement}>
        Decrement
      </button>
      <button type='button' onClick={increment}>
        Increment
      </button>
      <button
        type='button'
        onClick={() => setCounterValue(Math.floor(Math.random(0, 1) * 100))}
      >
        Randomize
      </button>
    </div>
  );
};

export default Buttons;
```

App.js

```javascript
import React from 'react';
import Display from './Display';
import Buttons from './Buttons';
import './App.css';

function App() {
  return (
    <div className='App'>
      <div className='container'>
        <Display stateKey='counter' />
        <Display stateKey='totalIncrements' />
        <Display stateKey='totalDecrements' />
      </div>
      <Buttons />
    </div>
  );
}

export default App;
```

## createReducerContext

| Param            | Type     | Description                                                                                 | Optional / Required |
| ---------------- | -------- | ------------------------------------------------------------------------------------------- | ------------------- |
| reducer          | Function | Reducer for Context                                                                         | Required            |
| actions          | Object   | Map of actions                                                                              | Required            |
| initialState     | Object   | Initial state for reducer                                                                   | Required            |
| referenceContext | Boolean  | If true, provides a Context with a reference value (object) [docs](#referenceContext-param) | Optional            |
| equalityTest     | Function | Function to compare previous and current state [docs](#equalityTest-param)                  | Optional            |

- **Return Value**: Object - { **Provider**, **useSelector**, **useActions** }

### **Provider**

| Param     | Type   | Description                                              | Optional / Required |
| --------- | ------ | -------------------------------------------------------- | ------------------- |
| initState | Object | Overwrites initialState set through createReducerContext | Optional            |

Example

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from './context';

ReactDOM.render(
  <Provider initState={{ counter: 5 }}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

### **useSelector**

Uses [use-context-selection](https://www.npmjs.com/package/use-context-selection)

| Param    | Type     | Description                                  | Optional / Required |
| -------- | -------- | -------------------------------------------- | ------------------- |
| selector | Function | Selector function to retrieve slice of state | Required            |

- **Return Value**: any

Example

```javascript
const counter = useSelector((state) => state.counter);
```

```javascript
const multiple = useSelector((state) => ({
  counter: state.counter,
  totalIncrements: state.totalIncrements,
}));
```

### **useActions**

- **Return Value**: Object

Example

```javascript
const { increment } = useActions();

// ...

<button onClick={increment}>Increment</button>;
```

## referenceContext param

> If true, provides a Context with a reference value (object)

context.js

```javascript
import {createReducerContext} from 'real-simple-context';

const initialState = { ... };

const reducer = (state = initialState, action) => {
    // .....
}

const actions = { ... };

const { Provider, useSelector, useActions, useReference } = createReducerContext(
    reducer,
    actions,
    initialState,
    true
);
```

AppComponent.js

```javascript
import React from 'react';
import { useReference } from './context';

const AppComponent = (props) => {
  const reference = useReference();

  React.useEffect(() => {
    reference.current.AppConfig = props.AppConfig;
  }, []);

  // ....
};
```

## equalityTest param

> Function to compare previous and current state

context.js

```javascript
import isEqual from 'lodash/isEqual';
import {createReducerContext} from 'real-simple-context';

const initialState = { ... };

const reducer = (state = initialState, action) => {
    // .....
}

const actions = { ... };

const { Provider, useSelector, useActions } = createReducerContext(
    reducer,
    actions,
    initialState,
    false,
    isEqual //will do a recursive equality check
);
```

## Reducer and initialState with vanilla JS

When creating the reducer in normal JS, it's important to set the default value of `state` to `initialState`:

```javascript
import {createReducerContext} from 'real-simple-context';

const initialState = { ... };

const reducer = (state = initialState, action) => {
    .....
}
```

If you don't do this, the property typing won't be correct on the selector state object when using `useSelector`.

## Typescript

`real-simple-context` exports two types for convenience when setting up a reducer context in typescript: `Reducer` and `DispatchAction`

```typescript
import {createReducerContext, Reducer, DispatchAction} from 'real-simple-context';

const initialState = {...};

const reducer:Reducer<typeof initialState> = (state, action) => {
    ....
}

// ....


const someAction = (dispatch:DispatchAction) => (someString:string) => {
    dispatch({
        type:'SOME_ACTION',
        someString
    })
}

....

```
