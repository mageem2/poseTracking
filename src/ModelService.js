import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetch ,asyncStorageIO,bundleResourceIO,decodeJpeg} from '@tensorflow/tfjs-react-native'

// export const loadModel{
//     const model = await tf.loadGraphModel(/*modelURL*/);

// } 

export default class ModelService{

    constructor(){
        //load the model
        //this.modelUrl = modelUrl;

        //this.modelJSON = require('../assets/model.json');
        //this.modelWeights = require('../assets/group1-shard1of1.bin');
        //this.loadModel(modelJSON, modelWeights)
        //const model_classes = require("../assets/classes.json")
        //this.model = await tf.loadGraphModel(bundleResourceIO(modelUrl,modelWeights));
        //const [model, setModel] = useState(null);
        this.model=null;
        this.model_classes=null;
        this.create.bind(this)
        this.classifyPose.bind(this)
        
    }

    async create(){
        await tf.ready();
        console.log("creating")
        const modelJSON = require('../assets/model.json');
        const modelWeights = require('../assets/group1-shard1of1.bin');
        const model_classes = require("../assets/classes.json")
        this.model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
        this.model_classes = model_classes;
        console.log(this.model)
        console.log("model loaded")
        return this.model

        //const ms = new ModelService(model)
        //return ms;
    }

    async classifyPose(pose){ 
        //use model to predict
        let array = this.formatArray(pose)
        array = tf.tensor(array)
        //console.log("model:", this.model)
        if(this.model){
            let predictionTensor = this.model.predict(array);
            //console.log("Prediction:", predictionTensor)
            //console.log("topk", prediction.topk)
            const poseName = this.decodePredictions(predictionTensor,this.model_classes);
            console.log(poseName)
            return poseName
        }
    }

    decodePredictions(prediction, classes,topK=3){
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
    
    transpose(arr){
        for (let i = 0; i < arr.length; i++) {
           for (let j = 0; j < i; j++) {
              const tmp = arr[i][j];
              arr[i][j] = arr[j][i];
              arr[j][i] = tmp;
           };
        }
     }

    indexOfMax(arr) {
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

