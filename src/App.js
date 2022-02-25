import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import MainMenu from './MainMenu';
import PoseClassifier from './PoseClassifier';

export default function App() {
  return (
    <View>
      <MainMenu/>
    </View>
  );
}