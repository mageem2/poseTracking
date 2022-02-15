import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

// export const loadModel{
//     const model = await tf.loadGraphModel(/*modelURL*/);

// } 

export const classifyPose = async (jsonArray) => { 
    //use model to predict
    const modelUrl ='https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';
    const model = await tf.loadGraphModel(modelUrl);
    const zeros = tf.zeros([1, 224, 224, 3]);
    model.predict(zeros).print();
    //return  
}

export const formatArray = (poses)  => {
    if (poses.length > 0) {
        //define a new array
        let arr_expanded = []
        for (let i = 0; i < 33; i++) {
            //array.push??? x3 (x,y,z)
            arr_expanded.push(poses[0].keypoints3D[i]['x'])
            arr_expanded.push(poses[0].keypoints3D[i]['y'])
            arr_expanded.push(poses[0].keypoints3D[i]['z'])
            // console.log(poses[0].keypoints3D[i]['name'])
            // console.log(poses[0].keypoints3D[i]['x'])
        }
        //console.log(arr_expanded.length)
        }

    return arr_expanded
}