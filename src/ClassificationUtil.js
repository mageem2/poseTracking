import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetch ,asyncStorageIO,bundleResourceIO,decodeJpeg} from '@tensorflow/tfjs-react-native'

export default class ClassificationUtil{

    constructor(){
        this.model=null;
        this.model_classes=null;
        this.loadModel.bind(this)
        this.classifyPose.bind(this)
        this.model_url=null;
    }

    async loadModel(model_url){
        
        //Make sure tf is ready
        await tf.ready();

        //Try server-based model loading
        try {
            this.model = await tf.loadLayersModel(model_url);
            this.model_classes = require("./assets/classes.json");
            console.log("Loaded Tensor Server Model");

        //If server-based doesn't work, then load the statically bundled model
        //from within the source code
        }
        catch {
            const modelJSON = require('./assets/model.json');
            const modelWeights = require('./assets/group1-shard1of1.bin');
            this.model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights));
            this.model_classes = require('./assets/classes.json');
            console.log("Loaded Static Model");
        }
        return [this.model, this.model_classes]
    }

    async classifyPose (keypoints) { 
        //use model to predict
        let array = this.formatArray(keypoints)
        tensor_of_keypoints = tf.tensor(array)

        //If the model exists then do classification
        if(this.model){
            let predictionTensor = this.model.predict(tensor_of_keypoints);
            const poseName = this.decodePredictions(predictionTensor,this.model_classes);
            console.log(poseName)
            return poseName
        }
    }

    

    async getClassifiedPose (prediction, classes) {
        const {values, indices} = prediction.topk();
        const topkValues = values.dataSync();
        const topKIndices = indices.dataSync();
    
        const poseName = classes[topKIndices[0]];
        const confidence = topkValues[0]
    
        return [poseName, confidence];
    }

    async getClassifiedPoses (prediction, classes, pose_num) {
        const {values, indices} = prediction.topk(pose_num);
        const topkValues = values.dataSync();
        const topKIndices = indices.dataSync();
    
        const poseName = classes[topKIndices[0]];
        const confidence = topkValues[0]
    
        return [poseName, confidence];
    }
    
    formatArray(pose){
        let arr_expanded = new Array([])
        if (pose.length > 0) {
            //define a new array
            for (let i = 0; i < 33; i++) {
                arr_expanded[0].push(pose[0].keypoints3D[i]['x'])
                arr_expanded[0].push(pose[0].keypoints3D[i]['y'])
                arr_expanded[0].push(pose[0].keypoints3D[i]['z'])
            }
        }
        return arr_expanded
    }
}

