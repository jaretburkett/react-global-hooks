import { useState } from 'react';
import { objCopy } from './util'

export class GlobalState<T> {
  constructor(initialValue: T) {
    this._value = initialValue;
  }
  private _value: T;
  private _hooks: ((newVal: T) => void)[] = [];
  private _setValues:any[] = [];

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
    let toRemoveHooks = [];
    let toRemoveSetValues = [];
    // trigger the state update for each registered hook
    for (let i = 0; i < this._hooks.length; i++) {
      if(this._hooks[i]){
        try {
          this._hooks[i](newVal)
        } catch (e) {
          // threw an error, component muse have unmounted, add to remove list
          toRemoveHooks.push(this._hooks[i]);
        }
      } else {
        // hook no longer exist, add to remove list
        toRemoveHooks.push(this._hooks[i]);
      }
    }
    // trigger set values
    for (let i = 0; i < this._setValues.length; i++) {
      if(this._setValues[i]){
        try {
          this._setValues[i](newVal)
        } catch (e) {
          // threw an error, component muse have unmounted, add to remove list
          toRemoveSetValues.push(this._setValues[i]);
        }
      } else {
        // hook no longer exist, add to remove list
        toRemoveSetValues.push(this._setValues[i]);
      }
    }
    // remove any that do not exist or failed
    for(let i = 0; i < toRemoveHooks.length; i++){
      this._hooks.splice(this._hooks.indexOf(toRemoveHooks[i]), 1)
    }

    // remove any that do not exist or failed
    for(let i = 0; i < toRemoveSetValues.length; i++){
      this._setValues.splice(this._setValues.indexOf(toRemoveSetValues[i]), 1)
    }
  }

  use = (): [T, (newState: T) => void] => {
    return useGlobalState(this)
  }

  useValue = (): T => {
    return useGlobalState(this)[0];
  }

  onChange = (callback:(newVal: T) => void) => {
    if(!(this._hooks.includes(callback))){
      this._addHook(callback);
    }
  } 
  
  _addSetValueHook = (setValue:any) => {
    if(!(this._setValues.includes(setValue))){
      this._setValues.push(setValue);
    }
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
  // state._addHook((newVal:S) => {
  //   setValue(newVal);
  // });
  state._addSetValueHook(setValue)
  // return in a same use format as react useState hook
  return [value, state.set]
}