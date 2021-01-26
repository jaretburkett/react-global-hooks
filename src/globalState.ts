import { useState } from 'react';
import { objCopy } from './util'

type Hook = (newVal: any) => void;

class State {
  constructor(initialValue: any) {
    this._value = initialValue;
  }
  private _value: any;
  private _hooks: Hook[] = [];

  _addHook = (hook: Hook) => {
    this._hooks.push(hook);
  }

  get = () => {
    // use object copy to return a new instance of the object
    try {
      return objCopy(this._value);
    } catch (e) {
      // objCopy failed for some reason, just return normal value
      return this._value;
    }
  }

  set = (newVal: any) => {
    this._value = newVal;
    // keep an array of hooks to remove that no longer exist
    let toRemove = [];
    // trigger the state update for each registered hook
    for (let i = 0; i < this._hooks.length; i++) {
      if(this._hooks[i]){
        try {
          this._hooks[i](newVal)
        } catch (e) {
          // threw an error, component muse have unmounted, add to remove list
          toRemove.push(this._hooks[i]);
        }
      } else {
        // hook no longer exist, add to remove list
        toRemove.push(this._hooks[i]);
      }
    }
    // remove any that do not exist or failed
    for(let i = 0; i < toRemove.length; i++){
      this._hooks.splice(this._hooks.indexOf(toRemove[i]))
    }
  }
}

export const createGlobalState = (initialValue: any) => {
  // return a new instance of State
  return new State(initialValue);
}

export const useGlobalState = (state: State): [any, (newState: any) => void] => {
  // piggyback on the react hook useState
  const [value, setValue] = useState(state.get());
  // add use state set hook to the state hooks
  state._addHook((newVal) => {
    setValue(newVal);
  });
  // return in a same use format as react useState hook
  return [value, state.set]
}