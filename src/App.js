import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Button } from 'react-native';
import PoseTracker from "./PoseTracker";


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
    //   "\nclassifiedExercise: ", classifiedExercise,
    //   "\nclassifiedExercises: ", classifiedExercises,
    //   "\nclassifiedPoses: ", classifiedPoses,
    //   "\nclassifiedPose: ", classifiedPose,
    //   "\nlearnedPoses: ", learnedPoses,
    //   "\nlearnedExercises: ", learnedExercises,
    //   "\nisLoading: ", isLoading,
    //   "\nisDetecting: ", isDetecting
    // );
  }, [classifiedExercise, classifiedPose, learnedPoses, learnedExercises, isDetecting, isLoading]);

  const renderLoading = () => {
    if (isLoading) {
      console.log("F*** React Native");
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      return <View></View>;
    }
  }

  return (
    <View style={styles.container}>
      {renderLoading()}
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

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  container: {
    flex: 1,
    justifyContent: "center"
  },
});