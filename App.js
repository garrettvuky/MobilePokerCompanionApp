import React, { useEffect, useState, setState} from "react";
import { SafeAreaView, StyleSheet, Button, TextInput, Alert, Text} from "react-native";
import { io } from "socket.io-client";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const SERVER = 'http://127.0.0.1:8080';
const socket = io(SERVER, {transports: ['websocket'], jsonp: false})
var gameID;
var players = [];
function HomeScreen({navigation}) {
  const [values, setValues] = React.useState({ Name: '', startingStacks: '',blinds: ''});
  playerName = values.Name;
  players.push(values.Name);
  const handleChange = (name, value) => {
    setValues({
      ...values,
      [name]: value
    });
  };
  function fetchPlayers() {
    return(
    fetch('http://127.0.0.1:3000/players')
      .then(response => response.json())
    )
  }
  const CreateGame = () => 
  {
    isLeader = true;
    (async () => {
      const rawResponse = await fetch('http://127.0.0.1:3000/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: values.Name,
                              startingStack: values.startingStacks, 
                              blinds: values.blinds, 
                              isLeader: isLeader})
      });
      const data = await rawResponse.json();
      console.log(data);
      gameID = data[0].id;
      navigation.navigate('StartGame');
    })();
    fetchPlayers().then(users  => {
      console.warn(users);
      });
  }
  const JoinGame = () =>
  {
    isLeader = false;
    socket.emit('is leader', isLeader);
    socket.emit('player name', values.Name);
    socket.emit('joining id', values.joiningID);
    fetchPlayers();
  }

  useEffect(() => {
    socket.connect();
  })

  return(
    <SafeAreaView style={styles.input}>
      <Button
        title={"Create Game"}
        onPress={() => CreateGame()}
      />
      <Button
        title={"Join Game"}
        onPress={() => JoinGame()}
      />
      <TextInput style = {styles.textput}
      placeholder="Enter Name:"
      onChangeText={(text) => handleChange('Name', text)}
      value={values.Name}
      />
      <TextInput style = {styles.textput}
      placeholder="Enter Game ID you wish to join:"
      onChangeText={(text) => handleChange('joiningID', text)}
      value={values.joiningID}
      />
      <TextInput style = {styles.textput}
      placeholder="Enter the starting stacks (creating game)"
      onChangeText={(text) => handleChange('startingStacks', text)}
      value={values.startingStacks}
      />
      <TextInput style = {styles.textput}
      placeholder="Enter the small blind amount (creating game)"
      onChangeText={(text) => handleChange('blinds', text)}
      value={values.blinds}
      />
    </SafeAreaView>
  )
}
function StartGame() {
  socket.on(gameID, (pName) => {
    const [curPlayers, setCurPlayers] = useState(players);
    curPlayers = players
    players.push(pName)
    setCurPlayers(players);
  })
  return(
    <SafeAreaView>
    <Text>{'Your Game Id is: ' + gameID}</Text>
    <Text>{'Current players: ' + players}</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  input: {
    flex: 1,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  textput: {
    height: 40,
    borderWidth: 1,
    padding: 10,
  }
});

const Stack = createStackNavigator();

function MyStack() {
  return (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen}/>
    <Stack.Screen name="StartGame" component={StartGame}/>
  </Stack.Navigator>
  )
};

export default function App() {
  return(
    <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
};