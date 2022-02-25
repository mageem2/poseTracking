import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetch ,asyncStorageIO,bundleResourceIO,decodeJpeg} from '@tensorflow/tfjs-react-native'

// export const loadModel{
//     const model = await tf.loadGraphModel(/*modelURL*/);

// } 

export default class ModelService{

    constructor(model){
        //load the model
        //this.modelUrl = modelUrl;

        //this.modelJSON = require('../assets/model.json');
        //this.modelWeights = require('../assets/group1-shard1of1.bin');
        //this.loadModel(modelJSON, modelWeights)
        //const model_classes = require("../assets/classes.json")
        //this.model = await tf.loadGraphModel(bundleResourceIO(modelUrl,modelWeights));
        //const [model, setModel] = useState(null);
        this.state={
            model: null
        };
        this.create.bind(this)
        this.classifyPose.bind(this)
        
    }

    async create(){
        await tf.ready();
        console.log("creating")
        const modelJSON = require('../assets/model.json');
        const modelWeights = require('../assets/group1-shard1of1.bin');
        this.state.model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
        console.log(this.state.model)
        console.log("model loaded")
        //const ms = new ModelService(model)
        //return ms;
    }

    test(){
        console.log("test passed")
    }

    async loadModel(){
        //await tf.ready();
        
    }

    async classifyPose(pose){ 
        //use model to predict
        let array = this.formatArray(pose)
        array = tf.tensor(array)
        //TODO:
        //use model to predict 
        //const zeros = tf.zero);
        console.log("model:", this.state.model)
        if(this.state.model){
            let prediction = this.state.model.predict(array);
            console.log("Prediction:", prediction)
        }
        //return string of pose
    }
    
    transpose(arr){
        for (let i = 0; i < arr.length; i++) {
           for (let j = 0; j < i; j++) {
              const tmp = arr[i][j];
              arr[i][j] = arr[j][i];
              arr[j][i] = tmp;
           };
        }
     }
    
    formatArray(pose){
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
        //let a = this.transpose(arr_expanded)
    
        return arr_expanded
    }
}

