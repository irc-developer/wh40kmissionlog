import { initialCatalog } from '../src/catalog/initial';
import { createGame, executeCommand } from '../src/domain/index';
import type { Game, GameIntent, SetupDraft } from '../src/domain/types';
export const setup: SetupDraft = {players:[{id:'p1',name:'Uno',faction:'Facción A',battleReady:true,secondaryMode:'fixed',fixedMissionIds:['secondary-assassination','secondary-engage']},{id:'p2',name:'Dos',faction:'Facción B',battleReady:false,secondaryMode:'fixed',fixedMissionIds:['secondary-assassination','secondary-engage']}],firstPlayerId:'p1',primaryMissionId:'primary-dominance',twistId:null};
export function game(): Game { const r=createGame(initialCatalog,setup,'match-1'); if(!r.ok) throw new Error(r.error.message);return r.value; }
export function apply(g:Game,intent:GameIntent): Game {const r=executeCommand(g,{operationId:`op-${g.revision}`,expectedRevision:g.revision,intent});if(!r.ok)throw new Error(r.error.message);return r.value;}

