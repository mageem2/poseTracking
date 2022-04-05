import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button } from 'react-native';
import PoseTracker from "./PoseTracker";

export default function App() {
  return (
    <View>
      <PoseTracker
        modelUrl={''}
        showFps={true}
        renderKeypoints={true}
        estimationModelType={"full"}
        cameraState={'front'}
        estimationThreshold={0.5}
        classificationThreshold={5}
        resetExercises={false}
      />
    </View>
  );
}
