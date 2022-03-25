import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetch ,asyncStorageIO, bundleResourceIO,decodeJpeg} from '@tensorflow/tfjs-react-native';
import OrderedDict from 'collections';

export default class ClassificationUtil{

    //Sets up stats hooks for the classificatiion util class
    //These can be used throughout the below functions as
    //if they were global variables
    constructor(){
        this.model=null;
        this.model_classes=null;
        this.loadModel.bind(this);
        this.classifyPose.bind(this);
        this.classifyPoses.bind(this);
        this.classifyPosesSorted.bind(this);
        this.getClassifiedPose.bind(this)
        this.getClassifiedPoses.bind(this)
        this.getClassifiedPosesSorted.bind(this)
        this.model_url=null;
        this.pose_map=null;
    }

    async loadModel(model_url){
        
        //Make sure tf is ready
        await tf.ready();

        //Try server-based model loading
        try {
            this.model = await tf.loadLayersModel(model_url);
            this.model_classes = require('./assets/classes.json');
            console.log("Loaded Tensor Server Model");

        //If server-based doesn't work, then load the statically bundled model
        //from within the source code
        }
        catch {
            const modelJSON = require('./assets/model.json');
            const modelWeights = require('./assets/group1-shard1of1.bin');
            const model_classes = require('./assets/classes.json');
            this.model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights));
            this.model_classes = model_classes;
            console.log("Loaded Static Model");
        }

        console.log(this.model);
        console.log(this.model_classes);
        
        //Create UTF-16 Encoded Pose Map 
        //-accounts for surrogate pairs
        //-accounts for unprintable characters
        //~65,000 possible pose encodings
        //-allows for use with movement window
        // and fuzzy string search
        function convertToHex(str) {
            var hex;
            var result = "";
            for (let i=0; i<str.length; i++) {
                hex = str.charCodeAt(i).toString(16);
                result += ("000"+hex).slice(-4);
            }
            result = "0x" + result;
            return result
        }

        const CharClassRanges = [
            '0-9',  // Numeric
            'a-zA-Z',  // Latin
            'α-ω',  // Greek
            '一-龯', // Japanese -- https://gist.github.com/terrancesnyder/1345094
            '\uFB1D-\uFB4F', // Hebrew (a few in range are unprintable)
            '!"#$%&\'()*+,.\/:;<=>?@\\[\\] ^_`{|}~-' // Special charcters
        ];
        const PrintableUnicode = new RegExp(`^[${CharClassRanges.join('')}]*$`, 'i');

        this.pose_map = {};  //JSON object that will act like a dictionary
        let num_poses = this.model_classes.length;
        let current_num = '';
        for (let i = 0; i < num_poses; i++) {
            current_num = '' + i;
            let code_point = convertToHex(current_num);
            // console.log("code point: ",code_point);
            let char = String.fromCodePoint(code_point);
            if (PrintableUnicode.test(char)) {
                const currentPose = this.model_classes[i];
                this.pose_map[currentPose] = char;
                console.log("char ", i+1, ":", char, " : ",code_point);
            } else {
                i--;
            }
        }
        console.log("Pose Map: ",this.pose_map);

        return [this.model, this.model_classes, this.pose_map]
    }

    // async getEncodedPoseMap (classes, numPoses) {

    // }

    async classifyPose (keypoints) { 

        //use model to predict
        const array = this.formatArray(keypoints);
        const tensor_of_keypoints = tf.tensor(array);

        //If the model exists then do classification
        if(this.model){
            const predictionTensor = await this.model.predict(tensor_of_keypoints);
            const [poseName, confidence] = await this.getClassifiedPose(predictionTensor,this.model_classes);

            return [poseName, confidence];
        }
    }

    async classifyPoses (keypoints) { 
        //use model to predict
        const array = this.formatArray(keypoints);
        const tensor_of_keypoints = tf.tensor(array);

        //If the model exists then do classification
        if(this.model) {
            const predictionTensor = await this.model.predict(tensor_of_keypoints);
            const classifiedPoses = await this.getClassifiedPoses(predictionTensor,this.model_classes, this.model_classes.length);

            return classifiedPoses;
        }
    }

    async classifyPosesSorted (keypoints) {
        //use model to predict
        const array = this.formatArray(keypoints);
        const tensor_of_keypoints = tf.tensor(array);

        //If the model exists then do classification
        if(this.model) {
            const predictionTensor = this.model.predict(tensor_of_keypoints);
            const [poseNames, confidences] = this.getClassifiedPosesSorted(predictionTensor,this.model_classes, this.model_classes.length)[0];
            console.log(poseNames);
            console.log(confidences);

            return [poseNames, confidences];
        }
    }

    async getClassifiedPose (prediction, classes) {
        const {values, indices} = await prediction.topk();
        const topKValues = await values.data();
        const topKIndices = await indices.data();

        const poseName = classes[topKIndices[0]];
        const confidence = topKValues[0];

        return [poseName, confidence];
    }

    async getClassifiedPoses (prediction, classes, numPoses) {
        const {values, indices} = await prediction.topk(numPoses);
        const topKValues = await values.data();
        const topKIndices = await indices.data();

        let posesObject = {classifiedPoses : []}; //This will store an array of pose objects
                                                    //each with a name & confidence

        // console.log(posesObject);
        for (let i = 0; i < topKIndices.length; i++) {
            let tempPoseObject = {poseName:"", confidence: 0.00};
            tempPoseObject.poseName = classes[topKIndices[i]];
            tempPoseObject.confidence = topKValues[i];
            posesObject.classifiedPoses.push(tempPoseObject);
        }
        // console.log(posesObject);
        return posesObject;
    }

    async getClassifiedPosesSorted (prediction, classes, numPoses) {
        const {values, indices} = prediction.topk(numPoses, sorted=true);
        const topKValues = await values.data();
        const topKIndices = await indices.data();
    
        const poseNames = []
        const confidences = []

        for (let i = 0; i < topKIndices.length(); i++) {
            poseNames.push(classes[topKIndices[i]]);
            confidences.push(topKValues[i]);
        }
    
        return [poseNames, confidences];
    }
    
    formatArray(pose){
        let arr_expanded = new Array([])
        if (pose.length > 0) {
            //define a new array
            for (let i = 0; i < 33; i++) {
                arr_expanded[0].push(pose[0].keypoints3D[i]['x']);
                arr_expanded[0].push(pose[0].keypoints3D[i]['y']);
                arr_expanded[0].push(pose[0].keypoints3D[i]['z']);
            }
        }

        return arr_expanded
    }
}

