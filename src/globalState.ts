import { useState } from 'react';
import { objCopy } from './util'

export class GlobalState<T> {
  constructor(initialValue: T) {
    this._value = initialValue;
  }
  private _value: T;
  private _hooks: ((newVal: T) => void)[] = [];

  _addHook = (hook: (newVal: T) => void) => {
    this._hooks.push(hook);
  }

  get = (clone:boolean = false):T => {
    // if clone is true, use object copy to return a new instance of the object
    if(clone){
      try {
        return objCopy(this._value);
      } catch (e) {
        // objCopy failed for some reason, just return normal value
        return this._value;
      }
    } else {
      return this._value;
    }
  }

  set = (newVal: T) => {
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
      this._hooks.splice(this._hooks.indexOf(toRemove[i]), 1)
    }
  }

  use = (): [T, (newState: T) => void] => {
    return useGlobalState(this)
  }

  useValue = (): T => {
    return useGlobalState(this)[0];
  }

  onChange = (callback:(newVal: T) => void) => {
    this._addHook(callback);
  } 
}

export const createGlobalState = <S>(initialValue: S): GlobalState<S> => {
  // return a new instance of State
  return new GlobalState(initialValue);
}

export const useGlobalState = <S>(state: GlobalState<S>): [S, (newState: S) => void] => {
  // piggyback on the react hook useState
  const [value, setValue] = useState(state.get());
  // add use state set hook to the state hooks
  state._addHook((newVal:S) => {
    setValue(newVal);
  });
  // return in a same use format as react useState hook
  return [value, state.set]
}