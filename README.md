# React Global Hooks

React Global Hooks is a tiny, dead simple way to manage a global state piggy backing off React Hooks. It is extremely versatile, light weight, and fast. 

Because React Global State relies on react hooks, it will only work in functional components, just like react hooks. It will not work in class components. 

## Install 

You can install with 

```
npm install react-global-hooks --save
```

or 

```
yarn add react-global-hooks
```

## Usage

There is not a lot to implementation, you simply need somewhere to store your global states where you can import a single instance of those states into components that will use them. 

### Creating Global States

You create a global state using the `createGlobalState` initializer An example store file might look like this. 

```typescript
// ./src/store.ts

import { createGlobalState } from 'react-global-hooks';

class Store {
    countState1 = createGlobalState(0);
    countState2 = createGlobalState(0);
}

const store = new Store();
export default store;
```


### Using Global States

Each global state has 3 primary methods `set`, `get`, `use`. 

`set` allows you to set a new value for the global state. eg. `myState.set('hello world')`

`get` returns the current global state value. eg `myState.get()` . This will return a cloned version of the state value, and not a pointer to the actual value. Note: Using this method to get a value will not trigger an update within a react component. For that, you will need to use the `use` method.

`use` returns a two part array that works identicaly to React's `useState` method. eg `const [value, setValue] = myState.use()`. Ising this method in a react component will cause it to update if/when the state is updated. 

You use global states similarly to how you use the React hook `useState`. There are 2 methods. The first is using the `.use()` method of the global store. Such as.

```jsx
import store from './store';

export default function App(){
    const [count1, updateCount1] = store.countState1.use();

    ...
```

Or you can use the `useGlobalState` method.

```jsx
import store from './store';
import { useGlobalState } from 'react-global-hooks';

export default function App(){
    const [count1, updateCount1] = useGlobalState(store.countState1);

    ...
```

Both methods work identically and can be used interchangeably. 


### Updating Global States

Any component that uses a global state will update when the Global State is updated. You can update the global state 2 ways. 

You can use the returned update method from `useGlobalState` or `.use()`;

```jsx
import store from './store';

export default function App(){
    const [count1, updateCount1] = store.countState1.use();

    return (
        <div
            onClick={() => {
                updateCount1(count1 + 1);
            }}
        >
            {count1}
        </div>
    )
}
```

You can also update the global state using the `.set` method

```typescript
import store from './store';

export const incrementCount1 = () => {
    store.countState1.set(store.countState1.get() + 1);
}
```

## Future Development

I plan on adding more functionality to this library to handle global states that mimick the usage of other react hooks, such as `useRef`, `useEffect`, etc. Currently, only the `useState` hook is implemented, as I found it most important

## Typescript

The entire library is written in typescript and the states are properly typed. Whatever your initial type is when you create a state, will be the type of every returned state and the required type when updating the state. 

## Why did I build this?

Have you used other state managers? If so, why are you asking? They are all slow, bloated, hard to use, tedious to implement, and in general, pains in the a$$. React Global Hooks is fast, tiny, efficient, and extremely easy to use and implement.