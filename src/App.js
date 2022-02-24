import * as React from 'react';
import { StyleSheet, Button, View, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {Component} from 'react';
import { inlineStyles } from 'react-native-svg';

function HomeScreen({ navigation }) {
  return (
    <View style={styles.main}>
      <Text style={{fontSize: 30,}}>Choose a Pose</Text>
      <View style={styles.row}>
      <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('Camera')} >
        <Text style={styles.boxContent}>Tree pose</Text>
      </TouchableOpacity>

      <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('Camera')} >
        <Text style={styles.boxContent}>T pose</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.row}>
      <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('Camera')} >
        <Text style={styles.boxContent}>Warrior pose</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('Camera')} >
        <Text style={styles.boxContent}>Pose 4 (NOT HERE YET)</Text>
      </TouchableOpacity>
      </View>


    </View>
  );
}

function Camera({ navigation }) {
  return(
    //Classification Component
      <View style={styles.main}>
        <Text>Camera will go here with the call of component</Text>
      </View>
  );
}


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2832C2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Pose Tracker'}}/>
        <Stack.Screen name="Camera" component={Camera} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

const styles = StyleSheet.create({
  main: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },

  box:{
    flex: 1,
    margin: 10,
    height: 150,
    width: '30%',
    borderRadius:20,
    backgroundColor : "#2832C2",
  },
  head:{
    textAlign: "center",
  },

  boxContent:{
    alignContent: "center",
    paddingTop: "50%",
    color: "white",
    textAlign: "center",
    fontSize: 20,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  }

  
})