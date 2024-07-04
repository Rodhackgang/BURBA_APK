import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const [iconsLoaded, setIconsLoaded] = useState(false); // État pour vérifier le chargement des icônes
  const navigation = useNavigation();

  useEffect(() => {
    // Simuler le chargement des icônes (remplacez cela par votre propre logique de chargement)
    setTimeout(() => {
      setIconsLoaded(true); // Met à jour l'état lorsque les icônes sont chargées
    }, 3000); // Simule un délai de chargement de 3 secondes

    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      // Vérifier si les icônes sont chargées avant de naviguer vers Home
      if (iconsLoaded) {
        navigation.navigate('Home');
      } else {
        console.log('Les icônes ne sont pas encore chargées.');
        // Vous pouvez ajouter ici un traitement en cas où les icônes ne sont pas encore chargées
      }
    });
  }, [navigation, progress, iconsLoaded]);

  const circumference = 100 * Math.PI;
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoB}>B</Text>
        <Text style={styles.text}>urba</Text>
      </View>
      <View style={styles.diviseContainer}>
        <Svg height="120" width="120" style={styles.progressCircle}>
          <Circle
            cx="60"
            cy="60"
            r="50"
            stroke="#FF0000"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
          <Circle
            cx="60"
            cy="60"
            r="40"
            stroke="#FFFF00"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
          <Circle
            cx="60"
            cy="60"
            r="30"
            stroke="#008000"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoB: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  text: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000',
  },
  diviseContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressCircle: {
    marginTop: 20,
  },
});
