import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button } from 'react-native';

import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as ScreenOrientation from 'expo-screen-orientation';
import { cameraWithTensors, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import Svg, { Circle, Line } from 'react-native-svg';

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

export default function PoseClassifier(
  props, 
  { 
    //Setting Default parameters for components
    modelUrl='', 
    showFps=false, 
    renderKeypoints=false,
    estimationModelType='full',
    cameraState='front',
    estimationThreshold='0.5'
  } 
) {
  //State variables to be used throughout the PoseClassifier Component
  // More info on state and hooks: https://reactjs.org/docs/hooks-intro.html
  const cameraRef = useRef(null);
  const [tfReady, setTfReady] = useState(false);
  const [detector, setDetector] = useState(null);
  const [poses, setPoses] = useState(null);
  const [fps, setFps] = useState(0);
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [classificationModel, setClassificationModel] = useState(null);
  const [classifiedPoses, setClassifiedPoses] = useState(null);
  const [modelClasses, setModelClasses] = useState(null);

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

      //Load Pose Classification Model
      //TODO://model url prop/param
      //TODO Classification_Prop
      //TODO:// adding in model label parsing for server-based and compile-time
      //TODO:// change into separate file

      //For information on serving a model from your own server
      // - Serving from your own server can make it so the app doesn't need to have a full update
      //   to add exercises and/or poses to the library
      // GO HERE: https://www.tensorflow.org/tfx/serving/serving_basic
      // const MODEL_URL = '';

      //Try server-based model loading
      try {
		    const modelUrl = props.modelUrl;
        const model = await tf.loadLayersModel(modelUrl);
        const model_classes = require("./assets/classes.json")
        setModelClasses(model_classes)
        setClassificationModel(model);

      //If server-based doesn't work, then load the statically bundled model
      //from within the source code
      } 
      catch {
        const modelJSON = require('./assets/model.json');
        const modelWeights = require('./assets/group1-shard1of1.bin');
        const model_classes = require("./assets/classes.json")
        setModelClasses(model_classes)
        const model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
        setClassificationModel(model);
      }

      setDetector(detector);

      // Ready!
      setTfReady(true);
    }

    prepare();
  }, []);

  const formatArray = (pose) => {
    let arr_expanded = new Array([])
    if (pose.length > 0) {
      //define a new array
      for (let i = 0; i < 33; i++) {
          //array.push??? x3 (x,y,z)
          arr_expanded[0].push(pose[0].keypoints3D[i]['x'])
          arr_expanded[0].push(pose[0].keypoints3D[i]['y'])
          arr_expanded[0].push(pose[0].keypoints3D[i]['z'])
          // console.log(poses[0].keypoints3D[i]['name'])
          // console.log(poses[0].keypoints3D[i]['x'])
      }
    }
    //const transposed_array = transpose(arr_expanded)
    return arr_expanded
    //return transposed_array
  }

  const decodePredictions = (prediction, classes,topK=4) => {
    const {values, indices} = prediction.topk(topK);
    const topKValues = values.dataSync();
    const topKIndices = indices.dataSync();
  
    const className = [];
    const probability = [];
    for (let i = 0; i < topKIndices.length; i++) {
        className.push(classes[topKIndices[i]])
        probability.push(topKValues[i])
    }
    const arg = this.indexOfMax(probability)
    //console.log("classes", className)
    //console.log("prob", probability)
    return className[arg%3];
  }

  const indexOfMax = (arr) => {
    if (arr.length === 0) {
        return -1;
    }
    var max = arr[0];
    var maxIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}

  const handleCameraStream = async (
    images,
    updatePreview,
    gl
  ) => {
    const loop = async () => {
      // Get the tensor and run pose detection.
      const image = images.next().value;
      const estimationConfig = {flipHorizontal: true};
      const timestamp = performance.now();
      const poses = await detector.estimatePoses(image, estimationConfig, timestamp);
      const latency = performance.now() - timestamp;
      setFps(Math.floor(1000 / latency));
      setPoses(poses);

      // Pose Classification
      // TODO:// refactor into file
      // TODO:// prop for confidence threshold
      const keypoints = formatArray(poses);
      const classification = await classificationModel.predict(keypoints); 
      setClassifiedPoses(classification);
	  // FIXME const predictionResponse = await this.modelService.classifyImage(poses); IMPLEMENT THIS LINE
      //ADD IN JSON PARSING, USE poses[0].keypoints3D
      if(poses.length>0){
        // Pose Classification
        // TODO:// refactor into file
        // TODO:// prop for confidence threshold
        const keypoints = formatArray(poses);
        tensor_keypoints = tf.tensor(keypoints)
        if(classificationModel){
          const classification_tensor = await classificationModel.predict(tensor_keypoints);
          const poseName = this.decodePredictions(classification_tensor,modelClasses); 
          //setClassifiedPoses(classification);
          console.log("Prediction:", poseName)
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
    if (poses != null && poses.length > 0) {
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
          if(k.score>MIN_KEYPOINT_SCORE){
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
          );}
        });

      const skeleton = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose).map(([i, j],index) => {
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
        if(kp1.score>MIN_KEYPOINT_SCORE){
        return (<Line
          key={`skeletonls_${index}`}
          x1={cx1}
          y1={cy1}
          x2={cx2}
          y2={cy2}
          r='4'
          stroke='red'
          strokeWidth='1'
        />);}
      });

      return <Svg style={styles.svg}>{skeleton}{keypoints}</Svg>;
    } else {
      return <View></View>;
    }
  };

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
      if(cameraType === Camera.Constants.Type.back){
        setCameraType(Camera.Constants.Type.front);
      }else{
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
          type={cameraType}
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
          title="Switch"/>
        {renderPose()}
        <Text>{classifiedPoses}</Text>
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
