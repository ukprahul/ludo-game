import { useGameStore } from './store/gameStore';
import HomeScreen        from './screens/HomeScreen';
import LobbyScreen       from './screens/LobbyScreen';
import GameScreen        from './screens/GameScreen';
import ResultScreen      from './screens/ResultScreen';
import OnlineLobbyScreen from './screens/OnlineLobbyScreen';

export default function App() {
  const screen = useGameStore(s => s.screen);

  return (
    // Dark outer shell — visible on desktop around the "phone"
    <div className="min-h-screen bg-gray-950 flex items-start justify-center">
      {/* Max-width phone container */}
      <div className="w-full max-w-[430px] min-h-screen relative bg-gray-900 overflow-hidden shadow-2xl">
        {screen === 'home'         && <HomeScreen />}
        {screen === 'lobby'        && <LobbyScreen />}
        {screen === 'online-lobby' && <OnlineLobbyScreen />}
        {screen === 'game'         && <GameScreen />}
        {screen === 'result'       && <ResultScreen />}
      </div>
    </div>
  );
}
