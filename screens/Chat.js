import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  getDocs,
  Firestore
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../colors';
import { LinearGradient } from 'expo-linear-gradient';
const Chat = () => {
  const route = useRoute();
  const { title } = route.params;
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation(); 

  const onSignOut = () => {
    signOut(auth)
      .then(() => Alert('Sign out success'))
      .catch((err) => console.log('Sign out error', err));
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10
          }}
          onPress={onSignOut}
        >
          <AntDesign name="logout" size={24} color={colors.gray} style={{marginRight: 10}}/>
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  

  useLayoutEffect(() => {
    const collectionRef = collection(database,'chats');
    const q = query(collectionRef, orderBy('createdAt', 'desc'), where('room', '==', title));  
    // const q = query(collectionRef, orderBy('createdAt', 'desc'));  

    const unsubscribe = onSnapshot(q,snapshot =>{
        console.log('snapshot')

        setMessages(snapshot.docs.map(doc=>({
            _id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text ,
            user: doc.data().user,
            room:title
        })));
    })

    return () => unsubscribe();
  }, []);

  const onSend = useCallback(async (messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

    const { _id, createdAt, text, user } = messages[0];

    try {
      // Add the message to the 'chats' collection
      await addDoc(collection(database, 'chats'), {
        _id,
        createdAt,
        text,
        user,
        room: title
      });

      // // Add only the message text to the 'rooms' collection
      // await addDoc(collection(database, 'rooms'), {
      //   text
      // });

      // Create a new collection with the message text as the collection name and add the message to it
      // await addDoc(collection(database, title), {
      //   _id,
      //   createdAt,
      //   text,
      //   user,
      //   room: title
      // });

    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }, []);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      
      wrapperStyle={{
        right: {
          backgroundColor: '#007AFF',
          borderRadius: 20,
          paddingVertical: 8,
          paddingHorizontal: 12,
          marginVertical: 5,
          maxWidth: '75%',
          alignSelf: 'flex-end',
        },
        left: {
          backgroundColor: '#E5E5EA',
          borderRadius: 20,
          paddingVertical: 8,
          paddingHorizontal: 12,
          marginVertical: 5,
          maxWidth: '75%',
          alignSelf: 'flex-start',
        },
      }}
      textStyle={{
        right: {
          color: '#fff',
          fontSize: 16,
        },
        left: {
          color: '#000',
          fontSize: 16,
        },
      }}
    />
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: auth?.currentUser?.email,
          // avatar: 'https://i.pravatar.cc/300',
          name: auth?.currentUser?.email
          
        }}
        messagesContainerStyle={styles.messageContainer}
        renderUsernameOnMessage={true}
        renderBubble={renderBubble}
        
      />
    </View>
  );
}

export default Chat
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.select({
      ios: '#ADD8E6', // Light Blue for iOS
      android: '#90EE90', // Light Green for Android
      web: '#D3D3D3', // Light Gray for Web
    }),
  },
  messageContainer: {
    backgroundColor: Platform.select({
      ios: '#ADD8E6', // Light Blue for iOS
      android: '#D3D3D3', // Light Green for Android
      web: '#90EE90', // Light Gray for Web
    }),
  },
});