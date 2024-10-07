import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import { SafeAreaView } from 'react-native'
const Chat = () => {
  return (
      //  <SafeAreaView style={{ flex: 1 }}>
      <GiftedChat
        messages={[]}
        onSend={(messages) => {
          // send message
        }}
      
      />
    // </SafeAreaView>
  )
}

export default Chat

const styles = StyleSheet.create({})