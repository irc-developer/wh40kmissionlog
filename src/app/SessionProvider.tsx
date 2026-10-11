import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { TerminalProps } from '../application/ui-contract';
import type { SessionController } from '../application/session';
const SessionContext=createContext<TerminalProps|null>(null);
export function SessionProvider({controller,children}:{controller:SessionController;children:ReactNode}){
 const [model,replace]=useReducer((_:TerminalProps['model'],next:TerminalProps['model'])=>next,controller.model);
 useEffect(()=>{const unsubscribe=controller.subscribe(()=>replace(controller.model));void controller.load();return unsubscribe;},[controller]);
 return <SessionContext.Provider value={{model,actions:controller}}>{children}</SessionContext.Provider>;
}
export function useSession(){const session=useContext(SessionContext);if(!session)throw new Error('Falta SessionProvider');return session;}
