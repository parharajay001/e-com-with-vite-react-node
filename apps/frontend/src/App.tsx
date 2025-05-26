import { GlobalProvider, store } from '@workspace/store';
import './App.css';
import { AppGuard } from './components/AppGuard';

function App() {
  return (
    <GlobalProvider store={store}>
      <AppGuard />
    </GlobalProvider>
  );
}

export default App;
