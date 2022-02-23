

export default function MainMenu() {
	const [atMenu, setAtMenu] = setState(true);
	const [targetPose, setTargetPose] = setState('');
	
	const handlePoseButtonPress = (poseFromButtom) ⇒ {
		setTargetPose(poseFromButton);
	}
	
	if(atMenu){
		return(
			<TouchableOpacity
				style={styles.poseButton}
				onPress={('pose_1') ⇒ handlePoseButtonPress}
			>
				<Text>Pose 1<Text/>
			<TouchableOpacity>
			<TouchableOpacity
				style={styles.poseButton}
				onPress={('pose_2') ⇒ handlePoseButtonPress}
			>
				<Text>Pose 2<Text/>
			<TouchableOpacity>
			<TouchableOpacity
				style={styles.poseButton}
				onPress={('pose_3') ⇒ handlePoseButtonPress}
			>
				<Text>Pose 3<Text/>
			<TouchableOpacity>
			<TouchableOpacity
				style={styles.poseButton}
				onPress={('pose_4') ⇒ handlePoseButtonPress}
			>
				<Text>Pose 4<Text/>
			<TouchableOpacity>
			}
		);
	}else {
		return (
			<PoseExample
			//props or inputs
				targetPose={poseStateVariable}
				style={styles.poseScreen}
				backButton
			></PoseExample>
		);
	}
}