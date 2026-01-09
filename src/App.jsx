import { StoreProvider, useStore } from './contexts/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { PasswordProtection } from './components/PasswordProtection';

function AppContent() {
  const { state } = useStore();

  return (
    <Layout>
      {state.view === 'dashboard' && <Dashboard />}
      {state.view === 'list' && <TaskList />}
    </Layout>
  );
}

function App() {
  return (
    <StoreProvider>
      <PasswordProtection>
        <AppContent />
      </PasswordProtection>
    </StoreProvider>
  );
}

export default App;
