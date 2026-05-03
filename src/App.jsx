import { useGameStore } from './store/gameStore';
import HomeScreen      from './screens/HomeScreen';
import LobbyScreen     from './screens/LobbyScreen';
import GameScreen      from './screens/GameScreen';
import ResultScreen    from './screens/ResultScreen';
import OnlineLobbyScreen from './screens/OnlineLobbyScreen';

export default function App() {
  const screen = useGameStore(s => s.screen);

  return (
    <div className="font-sans antialiased">
      {screen === 'home'          && <HomeScreen />}
      {screen === 'lobby'         && <LobbyScreen />}
      {screen === 'online-lobby'  && <OnlineLobbyScreen />}
      {screen === 'game'          && <GameScreen />}
      {screen === 'result'        && <ResultScreen />}
    </div>
  );
}
