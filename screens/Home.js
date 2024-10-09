import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList, RefreshControl, TextInput, LayoutAnimation, UIManager, Platform, Modal, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { Entypo } from '@expo/vector-icons';
import { auth, database } from '../config/firebase'; // Adjust the import based on your project structure
import { collection, getDocs, addDoc, writeBatch, query, orderBy, where, onSnapshot } from 'firebase/firestore';

const catImageUrl = "https://i.guim.co.uk/img/media/26392d05302e02f7bf4eb143bb84c8097d09144b/446_167_3683_2210/master/3683.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=49ed3252c0b2ffb49cf8b508892e452d";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Home = () => {
  const firestore = database; // Adjust the import based on your project structure
    const navigation = useNavigation();
    const [groupChats, setGroupChats] = useState([]);
    const [filteredGroupChats, setFilteredGroupChats] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        console.log('Home screen mounted');
        navigation.setOptions({
            headerLeft: () => (
                <FontAwesome name="search" size={24} color={colors.gray} style={{ marginLeft: 15 }} />
            ),
            headerRight: () => (
                <Image
                    source={{ uri: catImageUrl }}
                    style={{
                        width: 40,
                        height: 40,
                        marginRight: 15,
                    }}
                />
            ),
        });
    }, [navigation]);

    useEffect(() => {
        fetchGroupChats();
    }, []);

    const fetchGroupChats = async () => {
        try {
            const roomsSnapshot = await getDocs(collection(firestore, 'rooms'));
            const groupChatsData = roomsSnapshot.docs.map(doc => doc.data()?.text);
            setGroupChats(groupChatsData);
            setFilteredGroupChats(groupChatsData); // Initialize filtered data
        } catch (e) {
            console.error('Error fetching group chats: ', e);
        }

    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchGroupChats();
        setRefreshing(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Add animation
        if (query) {
            const filteredData = groupChats.filter(chat => chat.toLowerCase().includes(query.toLowerCase()));
            setFilteredGroupChats(filteredData);
        } else {
            setFilteredGroupChats(groupChats);
        }
    };

    const generateInviteCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const createGroup = async () => {
        const inviteCode = generateInviteCode();
        const createdBy = auth?.currentUser?.email; // Replace with actual user ID or name
        const collectionRef = collection(database,'chats');
        const q = query(collectionRef, orderBy('createdAt', 'desc'), where('room', '==', newGroupName)); 
        try {
            await addDoc(collection(firestore, 'rooms'), {
                text: newGroupName,
                createdBy,
                inviteCode
            });

           
           
             
            fetchGroupChats(); // Refresh the list
            setModalVisible(false);
            setNewGroupName('');


      // Add only the message text to the 'rooms' collection
      // await addDoc(collection(database, 'rooms'), {
      //   text: newGroupName,
      //   createdBy,
      //   inviteCode
      // });

      // Create a new collection with the message text as the collection name and add the message to it
      // await addDoc(collection(database, newGroupName), {
      //   text: newGroupName,
      //   createdBy,
      //   inviteCode
      // });


      console.log('Message added to chats, rooms, and new collection:', newGroupName);
      await listAllCollections();
  
        } catch (e) {
            console.error('Error creating group: ', e);

        }
    };

    const clearAllCollections = async () => {
      try {
          const collections = await getColw(firestore);
          for (const collectionRef of collections) {
              const querySnapshot = await getDocs(collectionRef);
              const batch = writeBatch(firestore);

              querySnapshot.forEach((document) => {
                  batch.delete(doc(firestore, collectionRef.id, document.id));
              });

              await batch.commit();
              console.log(`All documents in the ${collectionRef.id} collection have been deleted.`);
          }
      } catch (error) {
          console.error('Error clearing collections: ', error);
      }
  };


  const listAllCollections = async () => {
    try {
      const collectionsSnapshot = await getDocs(collection(database, 'rooms'));
      collectionsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('docTitle:', data.text);
      });
    } catch (e) {
      console.error('Error listing collections: ', e);
    }
  };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search group chats..."
                value={searchQuery}
                onChangeText={handleSearch}
            />
            <TouchableOpacity
                onPress={() => clearAllCollections()}
                style={styles.chatButton}
            >
                <Entypo name="chat" size={24} color={colors.lightGray} />
            </TouchableOpacity>
            <FlatList
                data={filteredGroupChats}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.groupChatItem}
                        onPress={() => navigation.navigate("Chat", { title: item })}
                    >
                        <Text style={styles.groupChatText}>{item}</Text>
                    </TouchableOpacity>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.createGroupButton}
            >
                <Text style={styles.createGroupButtonText}>Create Group</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <TextInput
                        style={styles.modalTextInput}
                        placeholder="Enter group name"
                        value={newGroupName}
                        onChangeText={setNewGroupName}
                    />
                    <Button title="Create" onPress={createGroup} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    searchBar: {
        height: 40,
        borderColor: colors.lightGray,
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 15,
        marginBottom: 20,
    },
    chatButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    groupChatItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    groupChatText: {
        fontSize: 18,
        color: colors.darkGray,
    },
    createGroupButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    createGroupButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTextInput: {
        height: 40,
        borderColor: colors.lightGray,
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
        width: '80%',
    },
});