import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import MathScreen from '../screens/MathScreen';
import PCScreen from '../screens/PCScreen';
import SVTScreen from '../screens/SVTScreen';
import ForumScreen from '../screens/ForumScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Chatscreen from '../screens/Chatscreen';
import PaymentScreen from '../screens/PaymentScreen';
import ConnexionScreen from '../screens/ConnexionScreen';

const Tab = createBottomTabNavigator();

function BottomTabsNavigator() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(false);
  const [hasToken, setHasToken] = React.useState(false);

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const connectionValue = await AsyncStorage.getItem('connexion');
        const premiumValue = await AsyncStorage.getItem('isPremium');
        setIsConnected(connectionValue === 'oui');
        setIsPremium(premiumValue === 'true');
      } catch (error) {
        console.error('Error retrieving connection from AsyncStorage:', error);
      }
    };

    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setHasToken(true);
        axios.get('https://burbaapi-production.up.railway.app/api/user', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          }
        })
        .then(async (response) => {
          if (response.data.user.isPremium) {
            await AsyncStorage.setItem('isPremium', 'true');
            setIsPremium(true);
          } else {
            await AsyncStorage.setItem('isPremium', 'false');
            setIsPremium(false);
          }
        })
        .catch((error) => {
          console.error('Error fetching premium status:', error);
        });
      } else {
        console.log('No token found in AsyncStorage.');
        setHasToken(false);
      }
    };

    checkConnection();
    checkToken();
  }, []);

  const getForumScreenComponent = () => {
    if (!hasToken) {
      return ConnexionScreen;
    } else if (isConnected) {
      return isPremium ? Chatscreen : PaymentScreen;
    } else {
      return ForumScreen;
    }
  };

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Mathématiques"
        component={MathScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="math-compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Physique Chimie"
        component={PCScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="charging-station" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Science de la Vie et de la Terre"
        component={SVTScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="science" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Forum"
        component={getForumScreenComponent()}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="forum-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="addusergroup" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabsNavigator;
