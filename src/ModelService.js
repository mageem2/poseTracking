import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

// export const loadModel{
//     const model = await tf.loadGraphModel(/*modelURL*/);

// } 

export default class ModelService{

    constructor(modelUrl){
        //load the model
        //this.modelUrl = modelUrl;
        //this.model = await tf.loadGraphModel(modelUrl)
        this.model = null;
        
    }

    async create(){
        console.log("creating")
        const ms = new ModelService("model")
        return ms;
    }
    test(){
        console.log("test passed")
    }

    async classifyPose(pose){ 
        //use model to predict
        this.formatArray(pose)
        const zeros = tf.zeros([1, 224, 224, 3]);
        this.model.predict(zeros).print();
        //return  
    }
    
    async formatArray(pose){
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
}

