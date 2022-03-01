import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button } from 'react-native';
import PoseClassifier from "./PoseClassifier";

export default function App() {
    return (
      <View>
        <PoseClassifier/>
      </View>
    );
}
  