import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { QuizIntroScreen } from '../screens/QuizIntroScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { QuizResultsScreen } from '../screens/QuizResultsScreen';
import { DevResetScreen } from '../screens/DevResetScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { storage } from '../lib/storage';
import { generateRIASECResultFromQuizAnswers } from '../lib/riasec';
import quizQuestionsData from '../data/quiz-questions.json';

type RootStackParamList = {
  Splash: undefined;
  DevReset: undefined;
  Onboarding: undefined;
  QuizIntro: undefined;
  Quiz: undefined;
  QuizResults: { reportMode?: boolean } | undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [showDevReset, setShowDevReset] = useState(false);

  const handleSplashFinish = useCallback((route: 'home' | 'onboarding' | 'quiz') => {
    if (route === 'home') {
      setInitialRoute('Main');
    } else if (route === 'quiz') {
      setInitialRoute('QuizIntro');
    } else {
      setInitialRoute('Onboarding');
    }
  }, []);

  const handleShowDevReset = useCallback(() => {
    setShowDevReset(true);
  }, []);

  const handleDevResetComplete = useCallback(() => {
    setShowDevReset(false);
    setInitialRoute(null);
  }, []);

  if (showDevReset) {
    return <DevResetScreen onReset={handleDevResetComplete} />;
  }

  if (!initialRoute) {
    return <SplashScreen onFinish={handleSplashFinish} onDevMenu={handleShowDevReset} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onComplete={() => props.navigation.replace('QuizIntro')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="QuizIntro">
          {(props) => (
            <QuizIntroScreen
              {...props}
              onStart={() => props.navigation.navigate('Quiz')}
              onBack={() => props.navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Quiz">
          {(props) => (
            <QuizScreen
              {...props}
              onComplete={async (answers) => {
                const result = generateRIASECResultFromQuizAnswers(
                  quizQuestionsData as any,
                  answers
                );
                await storage.riasec.set(result);
                await storage.xp.add(100, '적성 검사 완료', 'quiz');

                const currentUser = await storage.user.get();
                if (currentUser) {
                  await storage.user.set({
                    ...currentUser,
                    onboardingCompleted: true,
                  });
                }

                props.navigation.replace('QuizResults');
              }}
              onBack={() => props.navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="QuizResults">
          {(props) => {
            const reportMode = (props.route.params as any)?.reportMode === true;
            return (
              <QuizResultsScreen
                {...props}
                onComplete={() => props.navigation.replace('Main')}
                onBack={reportMode ? () => props.navigation.goBack() : undefined}
              />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
