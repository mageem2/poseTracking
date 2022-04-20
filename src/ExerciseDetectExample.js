import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import PoseTracker from "./PoseTracker";

export default function PoseCompareExample() {
    const UNDEFINED_POSE = "Undefined Pose";
    const UNDEFINED_EXERCISE = "Undefined Exercise";

    const [cameraType, setCameraType] = useState('front');
    const [classifiedPoses, setClassifiedPoses] = useState(null);
    const [classifiedPose, setClassifiedPose] = useState(["",0.00]); //This helps avoid rendering problems where
                                                                     //the poseName can equal null
    const [classifiedExercises, setClassifiedExercises] = useState(null);
    const [classifiedExercise, setClassifiedExercise] = useState(null);
    const [learnedPoses, setLearnedPoses] = useState(null);
    const [learnedExercises, setLearnedExercises] = useState(null);
    const [isDetecting, setIsDetecting] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

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
        console.log(
          "\nclassifiedExercise: ", classifiedExercise,
        //   "\nclassifiedExercises: ", classifiedExercises,
        //   "\nclassifiedPoses: ", classifiedPoses,
        //   "\nclassifiedPose: ", classifiedPose,
        //   "\nlearnedPoses: ", learnedPoses,
        //   "\nlearnedExercises: ", learnedExercises,
        //   "\nisLoading: ", isLoading,
        //   "\nisDetecting: ", isDetecting
        );
    }, [classifiedExercise, classifiedPose, learnedPoses, learnedExercises, isDetecting, isLoading]);

    const renderLoading = () => {
        if (isLoading) {
            console.log("Loading PoseTracker");
            return (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size={200}
                        color="#ffffff"
                        animating={true}
                        style={styles.activityIndicator}
                    />
                </View>
            );
        } else {
            return <View></View>;
        }
    }


    //renders the status box based on the above states
    const renderStatusBox = () => {
        //Component Rendering
        //is Loading is passed from the PoseClassifier Component
        if (isLoading) {
            //Here the user could define their own components
            //to load while the classifier is loading.
            //However, we are going to just use the defaulted
            //component by simply returning the Classifier Component
            //along with some loading visuals and the target pose name
            return (
                <View style={styles.purplebox}>
                    <View style={styles.row}>
                        <Text style={{fontSize: 30}}>Loading Pose Classification...</Text>
                    </View>
                </View>
            );
        } else {
            //depends on how we implement confidence here for component
            //likely, PoseClassifier will give back an array of confidences
            //if the confidence is lower than a certain number then
            //render the isDetecting screen.  If we use classificationArray
            //to do this, then we could make a bool function (isDetecting)
            if (classifiedExercise[0]==UNDEFINED_EXERCISE) {
                return (
                    <View style={styles.orangebox}>
                        <View style={styles.row}>
                                <Text style={{fontSize: 30, color: 'white'}}>Detecting Exercise...</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={styles.greenbox}>
                        <View style={styles.row}>
                            <Text style={{fontSize: 30, color: 'white'}}>{classifiedExercise[0]} : {classifiedExercise[1]}</Text>
                        </View>
                    </View>
                );
            }
        }
    }

        //PoseExample components
        return (
            <View style={styles.container}>
                <View style={styles.targetname}>
                    <Text style={{fontSize: 40}}>Do an exercise</Text>
                </View>
                <View style={styles.tracker}>
                    {renderLoading()}
                    <PoseTracker

                        // Inputs/Props
                        modelUrl={''}
                        showFps={true}
                        renderKeypoints={true}
                        estimationModelType={"full"}
                        cameraState={cameraType}
                        estimationThreshold={0.3}
                        classificationThreshold={2}
                        resetExercises={false}
                        autoRender={true}
                        estimationSmoothing={true}
                        undefinedPoseName={UNDEFINED_POSE}
                        undefinedExerciseName={UNDEFINED_EXERCISE}
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
                    <View style={styles.button}>
                        <Button
                            onPress={cameraTypeHandler}
                            title="Switch"
                        />
                    </View>
                    <View style={styles.column}>
                        {renderStatusBox()}
                    </View>
                </View>
            </View>
        );
}

const styles = StyleSheet.create({
    column : {
        flex: 1,
        height: 100,
        justifyContent: 'space-between',
        alignContent: 'center',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    orangebox: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#e89631",
        borderWidth: 2,
        borderRadius: 9,
        justifyContent: 'center',
        alignContent: 'center',
    },
    purplebox: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#af5dc2",
        borderWidth: 2,
        borderRadius: 9,
        justifyContent: 'center',
        alignContent: 'center',
    },
    greenbox: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#58a34d",
        borderWidth: 2,
        borderRadius: 9,
        justifyContent: 'center',
        alignContent: 'center',
    },  
    targetname: {
        flex: 1,
        flexDirection: 'row',
        top: 15,
        justifyContent: 'center',
    },
    button: {
        position: 'relative',
        width: '100%',
    },
    tracker: {
        position: 'absolute',
        left: 0,
        top: -200,
        zIndex: 100,
      },
    container: {
        flex: 1,
        justifyContent: "center",
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    }
});