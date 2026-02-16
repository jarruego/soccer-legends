/**
 * Componente principal de la aplicación
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './navigation/root-navigator';
import { useAuthStore } from '@store/index';

export default function App(): React.ReactElement {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}
