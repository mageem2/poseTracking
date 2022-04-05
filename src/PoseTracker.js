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
const MIN_KEYPOINT_SCORE = 0.7;

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
const AUTO_RENDER = true;

export default function PoseTracker(
  {
    //Setting Default parameters for components
    modelUrl = '',
    showFps = true,
    renderKeypoints = true,
    estimationModelType = 'full',
    cameraState = 'front',
    estimationThreshold = 0.5,
    classificationThreshold = 5,
    resetExercises = false
  }
) {
  //State variables to be used throughout the PoseTracker Component
  // More info on state and hooks: https://reactjs.org/docs/hooks-intro.html
  const cameraRef = useRef(null);
  const [tfReady, setTfReady] = useState(false);
  const [detector, setDetector] = useState(null);
  const [poses, setPoses] = useState(null);
  const [estimationFps, setEstimationFps] = useState(0);
  const [classificationFps, setClassificationFps] = useState(0);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [classifiedPoses, setClassifiedPoses] = useState(null);
  const [classifiedPose, setClassifiedPose] = useState(null);
  const [classificationUtil, setClassificationUtil] = useState(null);
  //const [classificationModel, setClassificationModel] = useState(null);
  const [modelClasses, setModelClasses] = useState(null);
  const [poseMap, setPoseMap] = useState(null);
  const [exerciseMap, setExerciseMap] = useState(null);


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
          modelType: 'full',
          enableSmoothing: true,
          runtime: 'tfjs'
        }
      );
      setDetector(detector);

      //Load Classification Model and Other Related Assets

      //For information on serving a model from your own server
      // - Serving from your own server can make it so the app doesn't need to have a full update
      //   to add exercises and/or poses to the library
      // GO HERE: https://www.tensorflow.org/tfx/serving/serving_basic


      const classificationUtil = new ClassificationUtil();
      setClassificationUtil(classificationUtil);

      //model, label, and the associated hooks can be used to modify app (if needed)
      const { model, labels, pose_map, exercise_map } = await classificationUtil.loadClassification(modelUrl);
      if (model) {
        setClassificationModel(model);
        setModelClasses(labels);
        setPoseMap(pose_map);
        setExerciseMap(exercise_map);
      }

      // Ready!
      setTfReady(true);
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
      const estimationConfig = { flipHorizontal: true };
      const timestamp = performance.now();
      const poses = await detector.estimatePoses(image, estimationConfig, timestamp);
      const latency = performance.now() - timestamp;
      setEstimationFps(Math.floor(1000 / latency));
      setPoses(poses);

      // Pose Classification
      // TODO:// prop for confidence threshold
      if (poses.length > 0) {

        const [poseName, confidence] = await classificationUtil.classifyPose(poses);
        const classified_poses = await classificationUtil.classifyPoses(poses);
        if (poseName && confidence) {
          //console.log(classified_poses);
          classificationUtil.trackMovement();
          classificationUtil.classifyExercise();
        }

      }


      tf.dispose([image]);

      // Render camera preview manually when autorender=false.
      if (!AUTO_RENDER) {
        updatePreview();
        gl.endFrameEXP();
      }

      requestAnimationFrame(loop);
    };

    loop();
  };

  const renderPose = () => {
    if (poses != null && poses.length > 0 && props.renderKeypoints == true) {
      const keypoints = poses[0].keypoints
        .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
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
          if (k.score > MIN_KEYPOINT_SCORE) {
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
        if (kp1.score > MIN_KEYPOINT_SCORE) {
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
    if (showFps) {
      return (
      );
    } else {
      return (
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

  //TODO prop
  if (!tfReady) {
    return (
      <View style={styles.loadingMsg}>
        <Text>Loading...</Text>
      </View>
    );
  } else {

    const cameraTypeHandler = () => {
      if (cameraType === Camera.Constants.Type.back) {
        setCameraType(Camera.Constants.Type.front);
      } else {
        setCameraType(Camera.Constants.Type.back);
      }
    };

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
          autorender={AUTO_RENDER}
          // tensor related props
          resizeWidth={getOutputTensorWidth()}
          resizeHeight={getOutputTensorHeight()}
          resizeDepth={3}
          rotation={getTextureRotationAngleInDegrees()}
          onReady={handleCameraStream}
        />
        {/* TODO prop */}
        <Button
          onPress={cameraTypeHandler}
          title="Switch" />
        {renderPose()}
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
    zIndex: 30,
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
    zIndex: 20,
  },
});
