import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, Button } from 'react-native';

import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as ScreenOrientation from 'expo-screen-orientation';
import { cameraWithTensors, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import ClassificationUtil from './ClassificationUtil.js';

// tslint:disable-next-line: variable-name
const TensorCamera = cameraWithTensors(Camera);

const IS_ANDROID = Platform.OS === 'android';
const IS_IOS = Platform.OS === 'ios';

// Camera preview size.
//
// From experiments, to render camera feed without distortion, 16:9 ratio
// should be used fo iOS devices and 4:3 ratio should be used for android
// devices.
//
// This might not cover all cases.
const CAM_PREVIEW_WIDTH = Dimensions.get('window').width;
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);

// The score threshold for pose detection results.
//const MIN_KEYPOINT_SCORE = 0.7;

// The size of the resized output from TensorCamera.
//
// For movenet, the size here doesn't matter too much because the model will
// preprocess the input (crop, resize, etc). For best result, use the size that
// doesn't distort the image.
const OUTPUT_TENSOR_WIDTH = 180;
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);

// Whether to auto-render TensorCamera preview.
// AUTO_RENDER == true
//    - this will make it so that the camera preview
//      is dynamically rendered.  This is recommended
//      for almost all applications.
//    - This means the camera preview will render
//      regardless of the awaits inside the loop

export default function PoseTracker(
  {
    //Setting Default parameters for components

    //Inputs/Props from PoseTracker declaration
    modelUrl = '',
    showFps = true,
    renderKeypoints = true,
    estimationModelType = "full",
    cameraState = "front",
    classificationThreshold = 5,
    resetExercises = false,
    estimationSmoothing = true,
    autoRender = true,
    undefinedPoseName = "undefined_pose",
    undefinedExerciseName = "undefined_exercise",
    estimationThreshold = 0.7,
    classificationSmoothingValue = 1,
    movementWindowResetLimit = 20,

    //Outputs/Callbacks for PoseTracker declaration
    classifiedPose,
    classifiedPoses,
    classifiedExercise,
    classifiedExercises,
    learnedPoses,
    learnedExercises,
    isDetecting,
    isLoading
  }
) {

  //State variables to be used throughout the PoseTracker Component
  // More info on state and hooks: https://reactjs.org/docs/hooks-intro.html
  const cameraRef = useRef(null);
  const [tfReady, setTfReady] = useState(false);
  const [detector, setDetector] = useState(null);
  const [poses, setPoses] = useState(null);
  const [estimationFps, setEstimationFps] = useState(0);
  // const [classificationFps, setClassificationFps] = useState(0);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [classificationUtil, setClassificationUtil] = useState(null);
  const [isLoading_state, setIsLoading_state] = useState(true);

  //Pass default values to callback functions
  //-This keeps the library from breaking anything
  // on the outside of the library.
  //-Example: the classifiedPose 
  // callback in empty and if the user uses
  // that callback they will get errors when printing
  // the returned value to the screen because it is null
  //------------------------------------------------------
  useEffect(() => {
    //Returns:
    // --Array--
    // [pose_name, confidence value (negative or postive number)]
    // confidence value: more negative means less confident
    //  -this is a dynamic value which compares to other pose confidences

    var temp_object = [{"poseName":undefinedPoseName, "confidence":0.00}];
    classifiedPoses(temp_object);
    //Returns:
    // --Object--

    // Example Pose Array of Objects
    // Array [
    //       Object {
    //         "confidence": 0.008087530732154846,
    //         "poseName": "t_pose",
    //       },
    //       Object {
    //         "confidence": -0.2243289351463318,
    //         "poseName": "tree",
    //       },
    //       Object {
    //         "confidence": -1.0932643413543701,
    //         "poseName": "warrior",
    //       },
    // ]
    // confidence value: more negative means less confident
    //  -this is a dynamic value which compares to other pose confidences

    classifiedExercise([undefinedExerciseName, 0]);
    //Returns:
    // --Array--
    // [exercise_name, rep count]

    classifiedExercises({undefinedExerciseName: 0});
    //Returns:
    //--Object--

    //Example Exercise Object Structure
    //Object {
    // "pushup": 0,
    // "tree-to-t":13 
    // }

    learnedPoses([undefinedPoseName]);
    //Returns:
    // --Array--
    // [pose_name_1, pose_name_2]

    learnedExercises([undefinedExerciseName]);
    //Returns:
    // --Array--
    // [exercise_name_1, exercise_name_2]

    isDetecting(true);
    isLoading(true);
  },[]);  
  //---------------------END------------------------------


  useEffect(() => {
    async function prepare() {
      // Set initial orientation.
      const curOrientation = await ScreenOrientation.getOrientationAsync();
      setOrientation(curOrientation);

      // Listens to orientation change.
      ScreenOrientation.addOrientationChangeListener((event) => {
        setOrientation(event.orientationInfo.orientation);
      });

      // Camera permission.
      await Camera.requestCameraPermissionsAsync();

      // Wait for tfjs to initialize the backend.
      await tf.ready();

      // Load Blazepose model.
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          modelType: estimationModelType,
          enableSmoothing: estimationSmoothing,
          runtime: 'tfjs'
        }
      );
      setDetector(detector);

      //Load Classification Model and Other Related Assets

      //For information on serving a model from your own server
      // - Serving from your own server can make it so the app doesn't need to have a full update
      //   to add exercises and/or poses to the library
      // GO HERE: https://www.tensorflow.org/tfx/serving/serving_basic


      const classificationUtil_ = new ClassificationUtil();

      //model, label, and the associated hooks can be used to modify app (if needed)
      const [labels, learned_exercises] = await classificationUtil_.loadClassification(modelUrl);
      
      // console.log(
      //   "\n\n::::Learned poses: ", labels,
      //   "\n\n::::Learned exercises: ",learned_exercises
      // );

      learnedPoses(labels);     //sets learned poses for callback (output)
      learnedExercises(learned_exercises);//sets learned exercises for callback (output)
      classificationUtil_.setResetLimit(movementWindowResetLimit); //sets reset limit for exercise classification
      classificationUtil_.setSmoothingBuffer(classificationSmoothingValue); //sets smoothing buffer for exercise classification
      setClassificationUtil(classificationUtil_);

      // Ready!
      setTfReady(true);
      setIsLoading_state(false); //sets the PoseTracker state for isLoading_state to false
      isLoading(false);          //sets the isLoading callback to false (output)
    }

    prepare();
  }, []);

  const handleCameraStream = async (
    images,
    updatePreview,
    gl
  ) => {
    const loop = async () => {
      // Get the tensor and run pose detection.
      const image = images.next().value;
      const estimationConfig = {
        flipHorizontal: true
      };
      const timestamp = performance.now();
      const poses = await detector.estimatePoses(image, estimationConfig, timestamp);
      const latency = performance.now() - timestamp;
      setEstimationFps(Math.floor(1000 / latency));
      setPoses(poses);

      // 'Pose Classification and Exercise Classfication' - render loop
      if (poses.length > 0) {  //if poses have been detected
        const [poseName, confidence] = await classificationUtil.classifyPose(poses);
        const classified_poses = await classificationUtil.classifyPoses(poses);
        if (poseName && confidence && confidence > classificationThreshold) {
          classifiedPose([poseName, confidence]); //sets classified pose for callback (output)
          classifiedPoses(classified_poses); //sets classified poses for callback (output)
          isDetecting(false);        //sets isDetecting callback to false
          if (!resetExercises) {
            classificationUtil.trackMovement();
            classificationUtil.classifyExercise();
            const detected_exercise = classificationUtil.getClassifiedExercise();
            if (detected_exercise) {
              classifiedExercise(detected_exercise);
              classifiedExercises(classificationUtil.getClassifiedExercises());
            } else {
              //if there is no current exercise, then 
              classifiedExercise([undefinedExerciseName, 0]); //return undefined exercise and 0 reps
            }
          } else {
            classificationUtil.resetExercises(); //resets numbers on current classified exercises
          }
        } else { //pose confidence is lower than classificationThreshold
          if (resetExercises) { classificationUtil.resetExercises(); }
          classificationUtil.trackUndefinedMovement(); //adds frame counts without affecting the movement window
          const detected_exercise = classificationUtil.getClassifiedExercise();
          const detected_exercises = classificationUtil.getClassifiedExercises();
          if (detected_exercise) {
            classifiedExercise(detected_exercise);
            classifiedExercises(detected_exercises);
          } else {
            //if there is no current exercise, then
            classifiedExercise([undefinedExerciseName, 0]); //return undefined exercise and 0 reps
            classifiedExercises(detected_exercises);
          }
          isDetecting(true);        //sets isDetecting callback to true because confidence is too low
          classifiedPose([undefinedPoseName, 0.00]); //sets classified pose for callback (output)
        }
      }

      tf.dispose([image]);

      // Render camera preview manually when autorender=false.
      if (!autoRender) {
        updatePreview();
        gl.endFrameEXP();
      }

      requestAnimationFrame(loop); //allows for a UI friendly render loop
    };

    loop();
  };

  const renderPose = () => {
    if (poses != null && poses.length > 0 && renderKeypoints == true) {
      const keypoints = poses[0].keypoints
        .filter((k) => (k.score ?? 0) > estimationThreshold)
        .map((k) => {
          // Flip horizontally on android.
          const x = IS_ANDROID ? OUTPUT_TENSOR_WIDTH - k.x : k.x;
          const y = k.y;
          let cx =
            (x / getOutputTensorWidth()) *
            (isPortrait() ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT);
          let cy =
            (y / getOutputTensorHeight()) *
            (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
          if (k.score > estimationThreshold) {
            return (
              <Circle
                key={`skeletonkp_${k.name}`}
                cx={cx}
                cy={cy}
                r='4'
                strokeWidth='2'
                fill='#8B008B'
                stroke='white'
              />
            );
          }
        });

      const skeleton = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose).map(([i, j], index) => {
        const keypoints = poses[0].keypoints;
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        const x1 = IS_ANDROID ? OUTPUT_TENSOR_WIDTH - kp1.x : kp1.x;
        const y1 = kp1.y
        const x2 = IS_ANDROID ? OUTPUT_TENSOR_WIDTH - kp2.x : kp2.x;
        const y2 = kp2.y

        const cx1 =
          (x1 / getOutputTensorWidth()) *
          (isPortrait() ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT);
        const cy1 =
          (y1 / getOutputTensorHeight()) *
          (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
        const cx2 =
          (x2 / getOutputTensorWidth()) *
          (isPortrait() ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT);
        const cy2 =
          (y2 / getOutputTensorHeight()) *
          (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
        if (kp1.score > estimationThreshold) {
          return (<Line
            key={`skeletonls_${index}`}
            x1={cx1}
            y1={cy1}
            x2={cx2}
            y2={cy2}
            r='4'
            stroke='red'
            strokeWidth='1'
          />);
        }
      });

      return <Svg style={styles.svg}>{skeleton}{keypoints}</Svg>;
    } else {
      return <View></View>;
    }
  };

  const renderFps = () => {
    if (showFps && tfReady) {
      return (
        <View style={styles.fpsContainer}>
          <Text>FPS: {estimationFps}</Text>
        </View>
      );
    } else {
      return (
        <View></View>
      );
    }
  }

  const isPortrait = () => {
    return (
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
    );
  };

  const getOutputTensorWidth = () => {
    // On iOS landscape mode, switch width and height of the output tensor to
    // get better result. Without this, the image stored in the output tensor
    // would be stretched too much.
    //
    // Same for getOutputTensorHeight below.
    return isPortrait() || IS_ANDROID
      ? OUTPUT_TENSOR_WIDTH
      : OUTPUT_TENSOR_HEIGHT;
  };

  const getOutputTensorHeight = () => {
    return isPortrait() || IS_ANDROID
      ? OUTPUT_TENSOR_HEIGHT
      : OUTPUT_TENSOR_WIDTH;
  };

  const getTextureRotationAngleInDegrees = () => {
    // On Android, the camera texture will rotate behind the scene as the phone
    // changes orientation, so we don't need to rotate it in TensorCamera.
    if (IS_ANDROID) {
      return 0;
    }

    // For iOS, the camera texture won't rotate automatically. Calculate the
    // rotation angles here which will be passed to TensorCamera to rotate it
    // internally.
    switch (orientation) {
      // Not supported on iOS as of 11/2021, but add it here just in case.
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        return 180;
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        return 270;
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        return 90;
      default:
        return 0;
    }
  };


  useEffect(() => {
    if (cameraState === 'front') {
      setCameraType(Camera.Constants.Type.front);
    } else {
      setCameraType(Camera.Constants.Type.back);
    }
  }, [cameraState]);

  //if classification is loading, then return the Loading... (text)
  if (isLoading_state == true) {
    return (
      <View style={styles.loadingMsg}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      // Note that you don't need to specify `cameraTextureWidth` and
      // `cameraTextureHeight` prop in `TensorCamera` below.
      <View
        style={
          isPortrait() ? styles.containerPortrait : styles.containerLandscape
        }
      >
        <TensorCamera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          autorender={autoRender}
          // tensor related props
          resizeWidth={getOutputTensorWidth()}
          resizeHeight={getOutputTensorHeight()}
          resizeDepth={3}
          rotation={getTextureRotationAngleInDegrees()}
          onReady={handleCameraStream}
        />
        {renderPose()}
        {renderFps()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerPortrait: {
    position: 'relative',
    width: CAM_PREVIEW_WIDTH,
    height: CAM_PREVIEW_HEIGHT,
    marginTop: Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
  },
  containerLandscape: {
    position: 'relative',
    width: CAM_PREVIEW_HEIGHT,
    height: CAM_PREVIEW_WIDTH,
    marginLeft: Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
  },
  loadingMsg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  camera: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  svg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 3,
  },
  fpsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 80,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, .7)',
    borderRadius: 2,
    padding: 8,
    zIndex: 4,
  },
});
