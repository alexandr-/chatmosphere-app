import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import createStateSetter from "../components/StateSetter";
import {
  connectionOptions,
  jitsiInitOptions,
} from "../components/connection/options";
import { connected } from "process";

declare global {
  interface Window {
    JitsiMeetJS: any;
    // localSettings: any
  }
}

type IJitsiConnection =  any;


type IConnectionStore = IState;

type IState = {
  jitsi: any,
  connection: IJitsiConnection,
   connected: boolean 
};
        const initialState: IState = {
          jitsi: undefined,
          connection:undefined,
          connected: false
        };

function createStore() {
  const Context = React.createContext<IConnectionStore>(initialState);

  function Provider({ children }: { children: React.ReactNode }) {
    const [state, stateSetter] = createStateSetter(
      useState<IState>(initialState)
    );

    useEffect(() => {
      const jsMeet = async () => window.JitsiMeetJS;
      jsMeet().then((value) => initConnection(value));
      return () => {
        state.connection?.disconnect()
        /* setState((state) => {
          state.connection?.disconnect()
          return state}); */
      };
    }, []);

    // const initConnection = useCallback((jsMeet) => {
    const initConnection = (jsMeet) => {
      jsMeet.setLogLevel(jsMeet.logLevels.ERROR);
      jsMeet.init(jitsiInitOptions);

      const tmpConnection = new jsMeet.JitsiConnection(
        null,
        null,
        connectionOptions
      );
      tmpConnection.addEventListener(
        jsMeet.events.connection.CONNECTION_ESTABLISHED,
        () => {
          stateSetter.connected.set(true);
          // setState(state=>({...state,connected:true}))
        }
      );
      tmpConnection.addEventListener(
        jsMeet.events.connection.CONNECTION_FAILED,
        () => console.log("failed")
      );
      tmpConnection.addEventListener(
        jsMeet.events.connection.CONNECTION_DISCONNECTED,
        () => console.log("disconnect, cleanup here")
      );
      tmpConnection.connect();
      // console.log("tmpConnection:",jsMeet,tmpConnection)
      // setState(state=>({...state,jitsi:jsMeet ,connection:tmpConnection}))
      // stateSetter.jitsi.set(jsMeet);
      // stateSetter.connection.set(tmpConnection);
      /* stateSetter.connection.set((connection) => ({
        ...connection,
        ...tmpConnection,
      })); */
      stateSetter.set(state=>({...state,jitsi:jsMeet,connection:tmpConnection}))
      // stateSetter.set(state=>({...state,connection:tmpConnection}))
    }//,[stateSetter,state])

    console.log("ConnectionStore:",state)
    const contextObject: IConnectionStore = {
      ...state,
    };

    // getPhoneState = () => contextObject
    return (
      <Context.Provider value={contextObject}>{children}</Context.Provider>
    );
  }

  const useStore = () => useContext<IConnectionStore>(Context);
  return { Provider, useStore };
}

const ConnectionStore = createStore();

export default ConnectionStore;
