import * as React from 'react';
import { StyleSheet, Button, View, Text, TouchableHighlight, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {Component} from 'react';
import { inlineStyles } from 'react-native-svg';
import {PoseTracker} from './PoseTracker';

function HomeScreen({ navigation }) {
  return (
    <View>
      <Text style={styles.main}>Choose a Pose</Text>
      <Text> </Text>
      <ScrollView style={styles.scrollView}>
      <View style={styles.row}>
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Tree pose</Text>
        </TouchableOpacity>

        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>T pose</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Warrior pose</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Push Ups</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Triangle pose</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Garland Pose</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Lotus pose</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Push Ups</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Pose 9 (NOT HERE YET)</Text>
        </TouchableOpacity>

        <TouchableOpacity style ={styles.box} onPress={() => navigation.navigate('CameraS')} >
          <Text style={styles.boxContent}>Pose 10 (NOT HERE YET)</Text>
        </TouchableOpacity>
      </View>


    </ScrollView>
    </View>
  );
}

// function CamaraT({ navigation, props }) {
//   return(
//     //Camara component opens here
//       <View style={styles.main}>
//         {/* <Text>PlaceHolder</Text> */}
//         <CameraJ/>
//       </View>
//   );
// }


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
        <Stack.Screen name="CameraS" getComponent={() => require('./PoseTracker').default} options={{title: 'Camera Tracker'}}/>
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