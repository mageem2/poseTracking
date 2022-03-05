import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button } from 'react-native';
import PoseTracker from "./PoseTracker";

export default function App() {
    return (
      <View>
        <PoseTracker/>
      </View>
    );
}
  