import React, { useEffect, useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button } from 'react-native';
import PoseTracker from "./PoseTracker";
import { set } from 'react-native-reanimated';


export default function App() {

  const [cameraType, setCameraType] = useState('front');
  const [classifiedPoses, setClassifiedPoses] = useState(null);
  const [classifiedPose, setClassifiedPose] = useState(null);
  const [classifiedExercises, setClassifiedExercises] = useState(null);
  const [classifiedExercise, setClassifiedExercise] = useState(null);
  const [learnedPoses, setLearnedPoses] = useState(null);
  const [learnedExercises, setLearnedExercises] = useState(null);
  const [isDetecting, setIsDetecting] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const handleClassifiedPose = (classified_pose) => {
    const [poseName, confidence] =  classified_pose;
    setClassifiedPose(classified_pose);
  }

  const handleClassifiedPoses = (classified_poses) => {
    setClassifiedPoses(classified_poses);
  }

  const handleClassifiedExercise = (classified_exercise) => {
    setClassifiedExercise(classified_exercise);
  }


  const handleClassifiedExercises = (classified_exercises) => {
    setClassifiedExercises(classified_exercises);
  }

  const handlePoseList = (learned_poses) => {
    setLearnedPoses(learned_poses);
  }

  const handleExerciseList = (learned_exercises) => {
    setLearnedExercises(learned_exercises);
  }

  const handleIsDetecting = (detecting) => {
    setIsDetecting(detecting);
  }

  const handleIsLoading = (loading) => {
    setIsLoading(loading);
  }

  const cameraTypeHandler = () => {
    if (cameraType === 'front') {
      setCameraType('back');
    } else {
      setCameraType('front');
    }
  }

  useEffect(() => {
    // console.log(
    // "\nclassifiedExercise: ", classifiedExercise,
    // "\nclassifiedExercises: ", classifiedExercises,
    // "\nclassifiedPoses: ", classifiedPoses,
    // "\nclassifiedPose: ", classifiedPose,
    // "\nlearnedPoses: ", learnedPoses,
    // "\nlearnedExercises: ", learnedExercises,
    // "\nisLoading: ", isLoading,
    // "\nisDetecting: ", isDetecting
    // );
  }, [classifiedExercise, classifiedPose, learnedPoses, learnedExercises, isDetecting, isLoading]);

  return (
    <View>
      <PoseTracker

        // Inputs/Props
        modelUrl={''}
        showFps={true}
        renderKeypoints={true}
        estimationModelType={"full"}
        cameraState={cameraType}
        estimationThreshold={0.5}
        classificationThreshold={5}
        resetExercises={false}
        autoRender={true}
        estimationSmoothing={true}
        undefinedPoseName={"UNDEFINED POSE"}
        undefinedExerciseName={"UNDEFINED EXERCISE"}
        classificationSmoothingValue={1}
        movementWindowResetLimit={20}

        // Outputs/Callbacks
        isDetecting={handleIsDetecting}
        isLoading={handleIsLoading}
        classifiedPoses={handleClassifiedPoses}
        classifiedPose={handleClassifiedPose}
        classifiedExercise={handleClassifiedExercise}
        classifiedExercises={handleClassifiedExercises}
        learnedPoses={handlePoseList}
        learnedExercises={handleExerciseList}
      />
      <Button
          onPress={cameraTypeHandler}
          title="Switch" />
    </View>
  );
}
