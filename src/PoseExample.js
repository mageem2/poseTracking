import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import PoseClassifier from './PoseClassifier';

export default function PoseExample() {
    
    const [atMenu, setAtMenu] = setState(true);
    const [targetPose, setTargetPose] = setState('');
    const [classifiedPose, setClassifiedPose] = setState(['',0.0]);
    
    const [cameraState, setCameraState] = setState('front');
    
    const [isLoading, setIsLoading] = setState(true);
    
    const handleClassification = (classificationArray) => {
        setClassifiedPose(classifcationArray);
    }
    
    const handleLoading = (isLoadingFromClassifier) => {
        setIsLoading(isLoadingFromClassifier);
    }
    
    //renders the status box based on the above states
    const renderStatusBox = () => {
        //Component Rendering
        //is Loading is passed from the PoseClassifier Component
        if(isLoading) {
            //Here the user could define their own components
            //to load while the classifier is loading.
            //However, we are going to just use the defaulted
            //component by simply returning the Classifier Component
            //along with some loading visuals and the target pose name
            return(
                <View style={styles.PurpleBox}>
                    <Text>Loading Pose Classification...</Text>
                </View>
            );
        }else {
            //depends on how we implement confidence here for component
            //likely, PoseClassifier will give back an array of confidences
            //if the confidence is lower than a certain number then
            //render the isDetecting screen.  If we use classificationArray
            //to do this, then we could make a bool function (isDetecting)
            if(isDetecting || classifiedPose[1] < 0.5) {
                return(
                    <View style={styles.OrangeBox}>
                        <Text>Loading Pose Classification...</Text>
                    </View>
                );
                
            //If the pose is above the confidence threshold
            //then we check if the target pose given by the 
            //main menu is equal to that returned by the PoseClassifier
            //Component.  Then we show a correct pose screen
            //if they are doing the target pose.  Else, we show
            //the incorrect screen.
            }else {
                //they are doing the correct pose (green)
                //we can do string comparison here, if need be
                if(classifiedPose[0]==props.targetPoseName) {
                    return(
                        <View style={styles.GreenBox}>
                            <Text>Correct Pose Detected!</Text>
                        </View>
                    );
                
                //they are doing the incorrect pose (red)
                } else {
                    return(
                        <View style={styles.RedBox}>
                            <Text>Incorrect Pose Detected</Text>
                        </View>
                    );
                }
            }
    }
    
    //PoseExample components
    return(
        <View style={styles.PoseExampleGUI}>
            <Text>{props.targetPoseName}</Text>
            <PoseClassifier
            {/*PoseClassifier props
                These are the values that
                are changed by anyone implementing the library
              Exercise Classification 
              will simply be another prop
              when it is finished
            */}
                modelURL={null}
                showFps={false}
                renderKeypoints={true}
                estimationModelType={'full'}
                classifiedPoses={handleClassification}
                isLoading={handleLoading}
                cameraState={cameraState}
                estimationThreshold={'0.5'}
            />
            {renderStatusBox()}
        </View>
    );
  }
}