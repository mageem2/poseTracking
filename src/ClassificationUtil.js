import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetch ,asyncStorageIO, bundleResourceIO, decodeJpeg} from '@tensorflow/tfjs-react-native';
import { and } from 'react-native-reanimated';
import { encode } from 'punycode';
export default class ClassificationUtil{

    //Sets up stats hooks for the classificatiion util class
    //These can be used throughout the below functions as
    //if they were global variables
    constructor(){
        this.model=null;
        this.model_classes=null;
        this.loadClassification.bind(this);
        this.classifyPose.bind(this);
        this.classifyPoses.bind(this);
        this.getClassifiedPose.bind(this);
        this.getClassifiedPoses.bind(this);
        this.getClassifiedEncodedPose.bind(this);
        this.classifyExercise.bind(this);
        this.trackMovement.bind(this);
        this.model_url=null;
        this.pose_map=null;
        this.exercise_map=null;
        this.exercise_name_map=null;
        this.exercise_trie=null;  
        this.movement_window=[];  //arramovement_window
        this.classified_pose=null;  //string
        this.classified_exercise=null;  //string
        this.classified_exercises=null; //object (JSON)

        //TODO Fixes or temporary
        this.framecounter=0;
        this.resetlimit=20;
        this.sameposecounter=0;
        this.smoothingbuffer=1;
    }

    //'loadClassification'
    async loadClassification(model_url){
        
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
        console.log("Known Poses: ",this.model_classes);
        
        //Create UTF-16 Encoded Pose Map 
        //------------------------------------------------------
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

        //Ranges of UTF-16 that aren't surrogates (high or low) or unprintable
        const CharClassRanges = [
            '0-9',  // Numeric
            'a-zA-Z',  // Latin
            'α-ω',  // Greek
            '一-龯', // Japanese -- https://gist.github.com/terrancesnyder/1345094
            '\uFB1D-\uFB4F', // Hebrew (a few in range are unprintable)
            '!"#$%&\'()*+,.\/:;<=>?@\\[\\] ^_`{|}~-' // Special charcters
        ];
        //Regex object to be used to detect if UTF-16 encoding is valid for pose encoding
        const PrintableUnicode = new RegExp(`^[${CharClassRanges.join('')}]*$`, 'i');

        //For loop to create pose map from classes.json pose names
        this.pose_map = {};  //JSON object that will act like a dictionary
                             //for poses and their associated UTF-16 encoding
        let num_poses = this.model_classes.length;
        let current_num = '';
        for (let i = 0; i < num_poses; i++) {  //creates a valid encoding for each
                                               //known pose in classes.json
            current_num = '' + i;
            let code_point = convertToHex(current_num);
            let char = String.fromCodePoint(code_point);
            if (PrintableUnicode.test(char)) {
                const currentPose = this.model_classes[i];
                this.pose_map[currentPose] = char;
            } else {
                i--;
            }
        }
        console.log("Pose Map: ",this.pose_map);

        //---------------------END------------------------------

        //Create Exercise Map
        //------------------------------------------------------
        //-utilizes pose map from above
        //-maps exercises to an exercise string
        const exercises = require('./assets/exercises.json');
        this.exercise_map = {};
        for (var exercise in exercises) {
            let encoded_exercise_string = "";
            let pose_name = "";
            for (let i = 0; i < exercises[exercise].length; i++){
                pose_name = exercises[exercise][i];
                encoded_exercise_string += this.pose_map[pose_name];
            }
            this.exercise_map[encoded_exercise_string] = exercise;
        }
        console.log("Exercise Map: ",this.exercise_map);

        //---------------------END------------------------------

        //Create Movement/Exercise Trie
        //------------------------------------------------------
        var FuzzyTrie = require('fuzzytrie');
        var trie = new FuzzyTrie();
        var exercises_ = this.exercise_map;
        for (var exercise in exercises_) {
            trie.add(exercise);
        }
        console.log("Exercise Trie: ", trie.all());
        this.exercise_trie = trie;
        //---------------------END------------------------------

        //---------------------END------------------------------

        //Create Classified Exercises Variable
        //------------------------------------------------------
        this.classified_exercises={};
        for (var exercise in this.exercise_map) {
            var exercise_name = this.exercise_map[exercise];
            this.classified_exercises[exercise_name]=0;
        }
        console.log("Classified Exercises: ",this.classified_exercises);
        //---------------------END------------------------------
        //Create Exercise Encoding Map
        //------------------------------------------------------
        // this.exercise_encoding_map={};
        // for (var exercise in this.exercise_map) {
        //     this.exercise_encoding_map[this.exercise_map[exercise]]= exercise;
        // }
        // console.log("Exercise Encoding Map: ",this.classified_exercises);
        //---------------------END------------------------------

        return [this.model, this.model_classes, this.pose_map, this.exercise_map]
    }

    // 'classifyPose'
    async classifyPose (keypoints) { 

        //use model to predict
        const array = this.formatArray(keypoints);
        const tensor_of_keypoints = tf.tensor(array);

        //If the model exists then do classification
        if(this.model){
            const predictionTensor = await this.model.predict(tensor_of_keypoints);
            const [poseName, confidence] = await this.getClassifiedPose(predictionTensor,this.model_classes);
            
            this.classified_pose = poseName;  //utilized with movement tracking / exercise classification

            return [poseName, confidence];
        }
    }

    // 'classifyPoses'
    async classifyPoses (keypoints) { 
        //use model to predict
        const array = this.formatArray(keypoints);
        const tensor_of_keypoints = tf.tensor(array);

        //If the model exists then do classification
        if(this.model) {
            const predictionTensor = await this.model.predict(tensor_of_keypoints);
            const classifiedPoses = await this.getClassifiedPoses(predictionTensor,this.model_classes, this.model_classes.length);

            const poseName = classifiedPoses.classifiedPoses[0].poseName;  //gets the highest confidence pose name from poses object
            this.classified_pose = poseName;  //utilized with movement tracking / exercise classification

            return classifiedPoses;  //Poses Object - look @ getClassifiedPoses

            // Example Pose Object Structure
            // Object {
            //     "classifiedPoses": Array [
            //       Object {
            //         "confidence": 0.008087530732154846,
            //         "poseName": "t_pose",
            //       },
            //       Object {
            //         "confidence": -0.2243289351463318,
            //         "poseName": "tree",
            //       },
            //       Object {
            //         "confidence": -1.0932643413543701,
            //         "poseName": "warrior",
            //       },
            //     ],
            //}
        }
    }

    // 'getClassfiedPose' returns an array of 
    // the highest confidence pose and its
    // confidence. This is applicable to any case 
    // where you simply needs the pose with the 
    // highest confidence.
    // Topk() from tf.js returns the value
    // and index with the highest value/confidence.
    async getClassifiedPose (prediction, classes) {
        const {values, indices} = await prediction.topk();
        const topKValues = await values.data();
        const topKIndices = await indices.data();

        const poseName = classes[topKIndices[0]];
        const confidence = topKValues[0];

        return [poseName, confidence];
    }

    // 'getClassifiedPoses' returns the PoseObject
    //for the predicitionTensor returned by model.predict(tensor_of_keypoints)
    //- Topk (when given number of inputs) gives back sorted values and indices
    //- This function essentially returns the pose names and confidences
    //  that are detected with each frame.
    async getClassifiedPoses (prediction, classes, numPoses) {
        const {values, indices} = await prediction.topk(numPoses);
        const topKValues = await values.data();
        const topKIndices = await indices.data();

        let posesObject = {classifiedPoses : []}; //This will store an array of pose objects
                                                    //each with a name & confidence
        for (let i = 0; i < topKIndices.length; i++) {
            let tempPoseObject = {poseName:"", confidence: 0.00};  //Maybe add encoding here: 
                                                                   //", encoding: this.exercise_map['']""
                                                                   //tempPoseObject.encoding = 
                                                                   // this.exercise_map[classes[topKIndices[i]]];
            tempPoseObject.poseName = classes[topKIndices[i]];
            tempPoseObject.confidence = topKValues[i];
            posesObject.classifiedPoses.push(tempPoseObject);
        }

        return posesObject;
        // Example Pose Object Structure
        // Object {
        //     "classifiedPoses": Array [
        //       Object {
        //         "confidence": 0.008087530732154846,
        //         "poseName": "t_pose",
        //       },
        //       Object {
        //         "confidence": -0.2243289351463318,
        //         "poseName": "tree",
        //       },
        //       Object {
        //         "confidence": -1.0932643413543701,
        //         "poseName": "warrior",
        //       },
        //     ],
        //}
    }

    //Simply returns the encoding a pose
    async getClassifiedEncodedPose (poseName) {
        if(poseName) {
            var encoded_pose = this.pose_map[poseName]
            if(encoded_pose) {return encoded_pose;}
            else {return "";}
        } else {
            return "";
        } 
    }

    //'trackMovement'
    // can be used to define in poseTracker when to
    // check the current classifiedPose and add it
    // to the movement window to be used with
    // exercise classification
    async trackMovement () {
        if(this.framecounter > this.resetlimit) {
            this.movement_window = []; //empties the exercise tracker
                                        //if the user has been doing the same
                                        //pose for too long (20 frames)
            this.framecounter=0; //resets framecount
        }
        try {  //makes sure a pose has been classified
            var pose_name = this.classified_pose;
        } catch {  //if classified pose is empty/undefined
            return;
        }
        let encoded_pose = await this.getClassifiedEncodedPose(pose_name);
        let has_pose = this.exercise_trie.has(encoded_pose); //looks at if pose exists in known
                                                              //exercises trie.
                                                              //undefined - the prefix exists
                                                              //true - the exact word exists
                                                              //false - the prefix or word doesn't exist
        if(this.movement_window.length > 0) {  //if movement window is not empty
            let temp_window = [...this.movement_window]; //copies movement window array
            temp_window.push(encoded_pose);
            let movement_window_with_new_encoded_pose = temp_window;
            let encoded_prefix = movement_window_with_new_encoded_pose.join("");
            let has_prefix = this.exercise_trie.has(encoded_prefix); //looks at if prefix exists in known
                                                                //exercises trie.
                                                                //undefined - the prefix exists
                                                                //true - the exact word exists
                                                                //false - the prefix or word doesn't exist
            var previous_pose = this.movement_window[this.movement_window.length - 1];
            if(previous_pose!=encoded_pose) {//a new pose has been detected
                if(has_prefix==undefined || has_prefix==true) {//pose exists in an exercise
                    if(this.sameposecounter > this.smoothingbuffer) {//makes sure user is not going between poses way too fast
                                                    //   because of close confidences between two poses
                                                    //  . Simply adds a little buffer to that situation.
                                                    // - A synthetic way of doing smoothing.
                        this.movement_window.push(encoded_pose);
                        this.sameposecounter=0;
                        this.framecounter=0;
                    } else {// Pose changed too fast.  Increment counters to assume same pose was done
                        this.sameposecounter++;
                        this.framecounter++;
                    }
                } else {//pose doesn't exist in exercise, but increment frame count anyway
                    this.framecounter++;
                }
            } else {//not a new pose from previous so add sameposecount and framecount
                this.sameposecounter++;
                this.framecounter++;
            }
        } else {  //movement window is empty
            if(has_pose==undefined) {
                this.movement_window.push(encoded_pose);
            }
            this.framecounter++;
        }
        console.log("Movement Window: ",this.movement_window);
    }

    async classifyExercise () {
        if (!this.movement_window) {return;}
        var movement_string = this.movement_window.join("");
        var max_distance = 1;
        var results = this.exercise_trie.find(movement_string,max_distance);
        for(var prefix in results) {//Look at each possible exercise from the current movement window.
            const distance = results[prefix];
            if(distance == 0) {     //movement window is a known exercise
                const classified_exercise_name = this.exercise_map[prefix];
                this.classified_exercise = classified_exercise_name;      //Save this classified exercise to
                                                                          //the state variable to keep track
                                                                          //of the most recent exercise.
                this.classified_exercises[classified_exercise_name] += 1; //Add a rep to classifed exercise
                                                                          //to classified exercise object.
                                                                          //This allows for rep tracking.
                this.movement_window = [];  //empties current movement window
            }
        }
        //console.log("Trie search: ",results);
        console.log("Classified Exercises: ", this.classified_exercises);
    }

    // 'formatArray' takes a 2d array of 33 pose keypoints/landmarks
    // and converts it to 99 separate points of data by separating
    // the x, y, and z points of data.  (33*3=99)
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
