import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Chat from "./screens/Chat";
import Login from "./screens/Login";

const Stack = createStackNavigator();

function ChatScreen() {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen name="Chat" component={Chat} /> */}
      <Stack.Screen name="Login" component={Login}
      options={
        {headerShown: false}
      }
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  return (
    <NavigationContainer>
      <ChatScreen />
      {/* <Login/> */}
    </NavigationContainer>
  );
} 


export default function App() {
  return <RootNavigator />;

}