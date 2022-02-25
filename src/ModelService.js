import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

// export const loadModel{
//     const model = await tf.loadGraphModel(/*modelURL*/);

// }
const loadClassificationModel = async (modelJson, modelWeights, modelUrl) => {
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
        const model = await tf.loadLayersModel(modelUrl);
        setClassificationModel(model);

    //If server-based doesn't work, then load the statically bundled model
    //from within the source code
    } 
    catch {
        try {
            model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
            setClassificationModel(model);
        } catch {
            console.log("Error in both web-based and compile-time model loading");
        }
    }
}

const classifyPose = async (classificationModel, pose) => { 
    //format keypoints from pose estimation
    let array = this.formatArray(pose)

    //use the loaded classification model to predict 
    const classification = predict(zeros).print();
    return classification
}

const formatArray = async (pose) => {
    let arr_expanded = []
    if (pose.length > 0) {
        //define a new array
        for (let i = 0; i < 33; i++) {
            //array.push??? x3 (x,y,z)
            arr_expanded.push(pose[0].keypoints3D[i]['x'])
            arr_expanded.push(pose[0].keypoints3D[i]['y'])
            arr_expanded.push(pose[0].keypoints3D[i]['z'])
            // console.log(poses[0].keypoints3D[i]['name'])
            // console.log(poses[0].keypoints3D[i]['x'])
        }
        //console.log(arr_expanded.length)
        }

    return arr_expanded
}

