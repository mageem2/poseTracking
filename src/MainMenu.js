import React, { useEffect, useState, useRef } from 'react';
import { View , TouchableOpacity} from 'react-native';
import PoseExample from './PoseExample';

export default function MainMenu() {

    const [atMenu, setAtMenu] = setState(true);
    const [targetPose, setTargetPose] = setState('');
    
    const handlePoseButtonPress = (poseFromButton) => {
        setTargetPose(poseFromButton);
    }
    
    if(atMenu) {
        return(
            <View>
                <TouchableOpacity
                    style={styles.poseButton}
                    onPress={() => {handlePoseButtonPress('t-pose')}}
                >
                    <Text>Pose 1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.poseButton}
                    onPress={() =>{handlePoseButtonPress('pose_2')}}
                >
                    <Text>Pose 2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.poseButton}
                    onPress={() => {handlePoseButtonPress('pose_3')}}
                >
                    <Text>Pose 3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.poseButton}
                    onPress={() => {handlePoseButtonPress('pose_4')}}
                >
                    <Text>Pose 4</Text>
                </TouchableOpacity>
            </View>
        );
    } else {
        return (
            <PoseExample
                targetPoseInput={targetPose}
                style={styles.poseScreen}
            ></PoseExample>
        );
    }
}
