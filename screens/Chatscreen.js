import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated } from 'react-native';
import axios from 'axios';
import { useHeaderHeight } from '@react-navigation/elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(''); // État pour stocker le nom de l'utilisateur
  const translateY = new Animated.Value(100);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    // Animation lorsque le composant se monte
    Animated.spring(translateY, {
      toValue: 0,
      speed: 1,
      bounciness: 20,
      useNativeDriver: true,
    }).start();

    // Récupération des messages depuis le backend
    axios.get('https://burbaapi-production.up.railway.app/api/messages')
      .then(response => {
        setMessages(response.data);
      })
      .catch(error => {
        console.error(error);
      });

    // Récupération du nom de l'utilisateur depuis AsyncStorage
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get('https://burbaapi-production.up.railway.app/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const user = response.data.user;
          setUser(user.name);
        } else {
          console.log('Aucun token trouvé dans AsyncStorage.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSend = async () => {
    if (message.trim()) {
      const newMessage = {
        user,
        text: message,
        isBot: false, // Indiquer que le message n'est pas envoyé par un bot
      };

      // Ajouter le message à l'état local avant de faire l'appel API
      setMessages([newMessage, ...messages]);

      try {
        // Enregistrer le message envoyé par l'utilisateur dans la base de données
        await axios.post('https://burbaapi-production.up.railway.app/api/messages', newMessage);

        // Vérifier si le message commence par #gpt
        if (message.startsWith('#gpt ')) {
          const query = message.substring(5); // Supprimer #gpt
          const response = await axios.get(`https://api.maher-zubair.tech/ai/chatgpt4?q=${encodeURIComponent(query)}`);
          const resultMessage = {
            user: 'Robot', // Indiquer que la réponse vient d'un robot
            text: response.data.result,
            isBot: true, // Indiquer que le message est envoyé par un bot
          };

          // Ajouter le message du bot à l'état local
          setMessages([resultMessage, newMessage, ...messages]);

          // Enregistrer le message du bot dans la base de données
          await axios.post('https://burbaapi-production.up.railway.app/api/messages', resultMessage);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du message ou de la requête à l\'API ChatGPT:', error);
      }

      setMessage('');
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.user === user;
    const isRobot = item.user === 'Robot';
    const userInitial = item.user ? item.user.charAt(0) : '';
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <TouchableOpacity style={styles.userIconContainer} onPress={() => alert(item.user)}>
          <Text style={styles.userInitial}>{isRobot ? '🤖' : userInitial}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { paddingTop: headerHeight, transform: [{ translateY }] }]}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez votre message ici"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#dddddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
    padding: 10,
    borderRadius: 15,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 10,
  },
  currentUserMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  otherUserMessage: {
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: '#000000',
    flex: 1,
  },
  userIconContainer: {
    marginLeft: 10,
  },
  userInitial: {
    fontSize: 24,
    color: '#007bff',
  },
});

export default MessageScreen;
