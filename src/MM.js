import * as React from 'react';
import { StyleSheet, Button, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function HomeScreen({ navigation }) {
  return (
    <View style={styles.main}>
      <Text>Choose a Pose</Text>
      <Button
        style={styles.box}
        title="Pose 1"
        onPress={() => navigation.navigate('Camara')}
      />
      <Button
        style={styles.box}
        title="Pose 2"
        onPress={() => navigation.navigate('Camara')}
      />
      <Button
        style={styles.box}
        title="Pose 3"
        onPress={() => navigation.navigate('Camara')}
      />

    </View>
  );
}

function Camara({ navigation }) {
  return(
    //Classification Component
      <View>
        <Text>Camara will go here with the call of component</Text>
      </View>
  );
}


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} style={styles.head}/>
        <Stack.Screen name="Camara" component={Camara} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  box:{
    marginTop: 10,
    flex: 2,
  },
  head:{
    backgroundColor: 'yellow',
  }
})
