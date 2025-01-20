import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initializeDb } from './services/database';
import Navigation from './navigation';
import Loading from './components/Loading';
import { Provider as PaperProvider } from 'react-native-paper';

const App = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initializeDb();
      setIsDbInitialized(true);
    };
    
    initialize();
  }, []);

  if (!isDbInitialized) {
    return <Loading />;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
