import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  ViroARScene,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroAmbientLight,
  ViroTrackingReason,
  ViroTrackingStateConstants,
  ViroARPlaneSelector,
  ViroNode,
} from "@reactvision/react-viro";

const { width } = Dimensions.get("window");

const models = [
  { name: "Bugatti", source: require("./res/bugatti.obj"), resources: [require("./res/bugatti.mtl")], type: "OBJ" },
  { name: "Future Car", source: require("./res/future_car/scene.gltf"), resources: [require("./res/future_car/scene.bin")], type: "GLTF" },
  { name: "Quantum Cube", source: require("./res/quantum_cube/scene.gltf"), resources: [require("./res/quantum_cube/scene.bin")], type: "GLTF" },
  { name: "Burning Cube", source: require("./res/burning_cube/scene.gltf"), resources: [require("./res/burning_cube/scene.bin")], type: "GLTF" },
  { name: "Cube", source: require("./res/placeholder-cube_5.glb"), resources: null, type: "GLB" },
];

const HomeScreen = ({ onStartAR }) => (
  <View style={styles.homeContainer}>
    <Text style={styles.homeTitle}>AR App</Text>
    <TouchableOpacity style={styles.startButton} onPress={onStartAR}>
      <Text style={styles.startButtonText}>Start AR</Text>
    </TouchableOpacity>
  </View>
);

const Menu = ({ models, onSelectModel, isMenuOpen, toggleMenu }) => {
  const translateXAnim = useRef(new Animated.Value(isMenuOpen ? 0 : -width * 0.7)).current;

  Animated.timing(translateXAnim, {
    toValue: isMenuOpen ? 0 : -width * 0.7,
    duration: 300,
    useNativeDriver: true,
  }).start();

  return (
    <Animated.View style={[styles.menu, { transform: [{ translateX: translateXAnim }] }]}>
      <ScrollView>
        {models.map((model) => (
          <TouchableOpacity key={model.name} style={styles.menuItem} onPress={() => onSelectModel(model)}>
            <Text style={styles.menuItemText}>{model.name}</Text>
            <Viro3DObject
              source={model.source}
              resources={model.resources}
              scale={[0.1, 0.1, 0.1]}
              rotation={[0, 45, 0]}
              type={model.type} // แก้ไขตรงนี้
              animation={{ name: "rotate", run: true, loop: true }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const SphereSceneAR = ({ selectedModel }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [planePosition, setPlanePosition] = useState(null);

  function onInitialized(state: any, reason: ViroTrackingReason) {
    console.log("onInitialized", state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setIsTracking(true);
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      setIsTracking(false);
    }
  }

  const handlePlaneSelected = (anchor: any) => {
    setPlanePosition(anchor.position);
  };

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroAmbientLight color={"#ffffff"} />
      {isTracking && (
        <ViroARPlaneSelector onPlaneSelected={handlePlaneSelected}>
          {planePosition && (
            <ViroNode position={planePosition}>
              <Viro3DObject
                source={selectedModel.source}
                resources={selectedModel.resources}
                scale={[0.2, 0.2, 0.2]}
                rotation={[0, 0, 0]}
                type={selectedModel.type} // แก้ไขตรงนี้
                animation={{ name: "rotate", run: true, loop: true }}
                onError={(error) => console.error("Error loading model:", error)}
                onLoadEnd={() => console.log("Model loaded successfully")}
              />
            </ViroNode>
          )}
        </ViroARPlaneSelector>
      )}
    </ViroARScene>
  );
};

export default () => {
  const [showAR, setShowAR] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const startAR = () => setShowAR(true);

  const selectModel = (model) => {
    setSelectedModel(model);
    toggleMenu();
  };

  return (
    <View style={styles.container}>
      {showAR ? (
        <>
          <ViroARSceneNavigator
            autofocus={true}
            initialScene={{ scene: () => <SphereSceneAR selectedModel={selectedModel} /> }}
            style={styles.arScene}
          />
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <Text style={styles.menuButtonText}>Menu</Text>
          </TouchableOpacity>
          <Menu models={models} onSelectModel={selectModel} isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </>
      ) : (
        <HomeScreen onStartAR={startAR} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  homeContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  homeTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
  startButton: { backgroundColor: "blue", padding: 15, borderRadius: 5 },
  startButtonText: { color: "white", fontSize: 18 },
  arScene: { flex: 1 },
  menuButton: { position: "absolute", top: 20, left: 20, backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 5 },
  menuButtonText: { color: "white" },
  menu: { position: "absolute", top: 0, left: 0, width: width * 0.7, height: "100%", backgroundColor: "rgba(0,0,0,0.8)", padding: 20 },
  menuItem: { padding: 10, alignItems: "center" },
  menuItemText: { color: "white", fontSize: 16 },
});