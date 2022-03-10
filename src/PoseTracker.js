import React, {Component } from 'react';
import * as tf from '@tensorflow/tfjs';
import {bundleResourceIO} from '@tensorflow/tfjs-react-native'
import { Text } from 'react-native';

// export const loadModel{
//     const model = await tf.loadGraphModel(/*modelURL*/);

// } 

const loadModel = async (modelURL, modelJson) => {
    console.log("creating")
    const modelJSON = require('../assets/model.json');
    const modelWeights = require('../assets/group1-shard1of1.bin');
    const model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
    console.log(model)
    console.log("model loaded")
    return model
}

const getModelClasses = async (model_classes) =>{
    const modelClasses = require("../assets/classes.json");
    return modelClasses
}

const classifyPose = async (model, pose, modelClasses)=>{
    //use model to predict
    let array = formatArray(pose)
    array = tf.tensor(array)
    const model_classes = getModelClasses(modelClasses)
    if(model){
        let predictionTensor = model.predict(array);
        const poseName = decodePredictions(predictionTensor,model_classes);
        console.log(poseName)
        return poseName
    }
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

const decodePredictions = (prediction, classes,topK=4)=>{
    const {values, indices} = prediction.topk(topK);
    const topKValues = values.dataSync();
    const topKIndices = indices.dataSync();
  
    const className = [];
    const probability = [];
    for (let i = 0; i < topKIndices.length; i++) {
        className.push(classes[topKIndices[i]])
        probability.push(topKValues[i])
    }
    const arg = indexOfMax(probability)
    //console.log("classes", className)
    //console.log("prob", probability)
    return className[arg];
}

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

    return arr_expanded
}

export default class PoseTracker extends Component{
    render(){
        const modelJson = this.props.modelJson;
        const modelWeights = this.props.modelURL;
        const modelClasses = this.props.modelClasses;
        const model = loadModel(modelWeights, modelJson)
        const poseName = classifyPose(model, this.props.pose, modelClasses)
        console.log("render()", poseName)
        return (
            <Text>{poseName}</Text>
        )
    }

}

