import * as React from 'react';
import { StyleSheet, Button, View, Text, TouchableHighlight, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Component } from 'react';
import { inlineStyles } from 'react-native-svg';
import { PoseTracker } from './PoseTracker';
import { PoseCompareExample } from './PoseCompareExample';
import { PoseDetectExample } from './PoseDetectExample';
import { ExerciseDetectExample } from './ExerciseDetectExample';

function HomeScreen({ navigation }) {
    return (
        <View>
            <Text style={styles.main}>Choose a Pose</Text>
            <Text> </Text>
            <ScrollView style={styles.scrollView}>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PoseCompare', { target_pose: 'tree', target_exercise: null })} >
                        <Text style={styles.boxContent}>Tree pose</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PoseCompare', { target_pose: 't_pose', target_exercise: null })} >
                        <Text style={styles.boxContent}>T pose</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PoseCompare', { target_pose: 'warrior', target_exercise: null })} >
                        <Text style={styles.boxContent}>Warrior pose</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PoseCompare', { target_pose: 'lotus', target_exercise: null })} >
                        <Text style={styles.boxContent}>Lotus pose</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PoseCompare', { target_pose: 'triangle', target_exercise: null })} >
                        <Text style={styles.boxContent}>Triangle pose</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PoseCompare', { target_pose: 'garland', target_exercise: null })} >
                        <Text style={styles.boxContent}>Garland Pose</Text>
                    </TouchableOpacity>
                </View>

                {/* <View style={styles.row}>
                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('CameraS', { target_pose: null, target_exercise: 'tree_to_t' })} >
                        <Text style={styles.boxContent}>Tree to T</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('CameraS', { target_pose: null, target_exercise: 'pushup' })} >
                        <Text style={styles.boxContent}>Push Ups</Text>
                    </TouchableOpacity>
                </View> */}

                <View style={styles.row}>
                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PoseDetect', { target_pose: 'allstatic', target_exercise: 'null' })} >
                        <Text style={styles.boxContent}>All static</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ExerciseDetect', { target_pose: 'null', target_exercise: 'allexercise' })} >
                        <Text style={styles.boxContent}>All exercise</Text>
                    </TouchableOpacity>
                </View>


            </ScrollView>
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function MainMenu() {
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
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Pose Tracker' }} />
                <Stack.Screen name="PoseCompare" getComponent={() => require('./PoseCompareExample').default} options={{ title: 'Pose Comparison', }} />
                <Stack.Screen name="PoseDetect" getComponent={() => require('./PoseDetectExample').default} options={{ title: 'Pose Detection', }} />
                <Stack.Screen name="ExerciseDetect" getComponent={() => require('./ExerciseDetectExample').default} options={{ title: 'Exercise Detection', }} />
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

    box: {
        flex: 1,
        margin: 10,
        height: 150,
        width: '30%',
        borderRadius: 20,
        backgroundColor: "#2832C2",
    },

    head: {
        textAlign: "center",
    },

    boxContent: {
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