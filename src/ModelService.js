import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

// export const loadModel{
//     const model = await tf.loadGraphModel(/*modelURL*/);

// }
const loadClassificationModel = async () =>

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

