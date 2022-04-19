import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import PoseTracker from "./PoseTracker";

export default function PoseCompareExample(
    {
        route
    }
) {
    const { target_pose, target_exercise } = route.params;

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
            console.log("Apparently Loading");
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
                    <Text>Loading Pose Classification...</Text>
                </View>
            );
        } else {
            //depends on how we implement confidence here for component
            //likely, PoseClassifier will give back an array of confidences
            //if the confidence is lower than a certain number then
            //render the isDetecting screen.  If we use classificationArray
            //to do this, then we could make a bool function (isDetecting)
            if (isDetecting || classifiedPose[1] < 0.5) {
                return (
                    <View style={styles.orangebox}>
                        <Text>Detecting Pose...</Text>
                    </View>
                );

                //If the pose is above the confidence threshold
                //then we check if the target pose given by the 
                //main menu is equal to that returned by the PoseClassifier
                //Component.  Then we show a correct pose screen
                //if they are doing the target pose.  Else, we show
                //the incorrect screen.
            } else {
                //they are doing the correct pose (green)
                //we can do string comparison here, if need be
                if (classifiedPose[0] == props.targetPoseName) {
                    return (
                        <View style={styles.greenbox}>
                            <Text>Correct Pose Detected!</Text>
                        </View>
                    );

                    //they are doing the incorrect pose (red)
                } else {
                    return (
                        <View style={styles.redbox}>
                            <Text>Incorrect Pose Detected</Text>
                        </View>
                    );
                }
            }
        }

        //PoseExample components
        return (
            <View style={styles.container}>
                <View style={styles.tracker}>
                    <Text>{target_pose}</Text>
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
                    <View style={styles.button}>
                        <Button
                            onPress={cameraTypeHandler}
                            title="Switch"
                        />
                    </View>
                    {renderStatusBox()}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    orangebox: {
    },
    redbox: {
    },
    purplebox: {
    },
    greenbox: {
    },
    loading: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 100,
        zIndex: 200,
    },
    button: {
        position: 'relative',
        width: '100%',
    },
    tracker: {
        position: 'absolute',
        left: 0,
        top: -120,
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