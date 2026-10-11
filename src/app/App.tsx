import { MissionTerminal } from '../features/terminal/MissionTerminal';
import { useSession } from './SessionProvider';
export function App(){const props=useSession();return <MissionTerminal {...props}/>;}
