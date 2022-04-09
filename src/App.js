import React, { useEffect, useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button } from 'react-native';
import PoseTracker from "./PoseTracker";


export default function App() {

  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [classifiedPoses, setClassifiedPoses] = useState(null);
  const [classifiedPose, setClassifiedPose] = useState(null);
  const [classifiedExercises, setClassifiedExercises] = useState(null);
  const [classifiedExercise, setClassifiedExercise] = useState(null);
  const [learnedPoses, setLearnedPoses] = useState(null);
  const [learnedExercises, setLearnedExercises] = useState(null);
  const [isDetecting, setIsDetecting] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const handleClassifiedPose = (classified_pose) => {
    console.log("classified pose: ",classified_pose);
    const [poseName, confidence] = classified_pose;
    setClassifiedPose([poseName, confidence]);
  }

  const handleClassifiedPoses = (classified_poses) => {
    console.log("classified poses: ",classified_poses);
    setClassifiedPoses(classified_poses);
  }

  const handleClassifiedExercise = (classified_exercise) => {
    console.log("classified_exercise: ", classified_exercise);
    // const [exercise, repcount] = classified_exercise;
    // setClassifiedExercise([exercise, repcount]);
    setClassifiedExercise(classified_exercise);
  }


  const handleClassifiedExercises = (classified_exercises) => {
    console.log("classified_exercises: ",classified_exercises);
    setClassifiedExercises(classified_exercises);
  }

  const handlePoseList = (learned_poses) => {
    console.log("learned poses: ",learned_poses);
    setLearnedPoses(learned_poses);
  }

  const handleExerciseList = (learned_exercises) => {
    console.log("learned exercises: ",learned_exercises);
    setLearnedExercises(learned_exercises);
  }

  const handleIsDetecting = (detecting) => {
    setIsDetecting(detecting);
  }

  const handleIsLoading = (loading) => {
    setIsLoading(loading);
  }
  const testLibrary = () => {
    console.log(
      "classifiedExercise: ", classifiedExercise,
      "classifiedExercises: ", classifiedExercises,
      "classifiedPoses: ", classifiedPoses,
      "classifiedPose: ", classifiedPose,
      "learnedPoses: ", learnedPoses,
      "learnedExercises: ", learnedExercises,
      "isLoading: ", isLoading,
      "isDetecting: ", isDetecting
    );
  }

  return (
    <View>
      <PoseTracker

        // Inputs/Props
        modelUrl={''}
        showFps={true}
        renderKeypoints={true}
        estimationModelType={"full"}
        cameraState={'front'}
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
        title="Test Library"
        color="#f194ff"
        onPress={() => testLibrary}
      />
    </View>
  );
}
