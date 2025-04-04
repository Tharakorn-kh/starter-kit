import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  ViroARScene,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroAmbientLight,
  ViroNode,
  ViroARCamera,
} from "@reactvision/react-viro";

const models = [
  { name: "Bugatti", source: require("./res/bugatti.obj"), resources: [require("./res/bugatti.mtl")], type: "OBJ" },
  { name: "Future Car", source: require("./res/future_car/scene.gltf"), resources: [require("./res/future_car/scene.bin")], type: "GLTF" },
];

const SphereSceneAR = ({ selectedModel, initialPosition }) => {
  return (
    <ViroARScene>
      <ViroAmbientLight color={"#ffffff"} />
      {selectedModel && (
        <ViroNode position={initialPosition}>
          <Viro3DObject
            source={selectedModel.source}
            resources={selectedModel.resources}
            scale={[0.1, 0.1, 0.1]}
            rotation={[0, 45, 0]}
            type={selectedModel.type}
            key={selectedModel.name}
            onError={(error) => {
              console.error("Error loading model:", error);
              Alert("Error loading model. Please check the console.");
            }}
            onLoadEnd={() => console.log("Model loaded successfully")}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
};

export default () => {
  const [showAR, setShowAR] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [initialPosition] = useState([0, -0.3, -1]);
  const [sceneKey, setSceneKey] = useState(0);

  const resetARSession = () => {
    setSceneKey(prevKey => prevKey + 1);
    console.log("Scene Key reset to:", sceneKey + 1);
    console.log("Selected Model:", selectedModel ? selectedModel.name : "None");
  };

  return (
    <View style={styles.container}>
      {showAR ? (
        <>
          {selectedModel ? (
            <ViroARSceneNavigator
              key={sceneKey}
              autofocus={true}
              initialScene={{
                scene: () => <SphereSceneAR selectedModel={selectedModel} initialPosition={initialPosition} />,
              }}
              style={styles.arScene}
              onError={(error) => {
                console.error("ViroARSceneNavigator Error:", error);
                alert("ViroARSceneNavigator Error. Please check the console.");
              }}
            />
          ) : (
            <View style={styles.menuContainer}>
              <Text style={styles.title}>Please Select a Model</Text>
            </View>
          )}

          <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
            <Text style={styles.menuButtonText}>Select Model</Text>
          </TouchableOpacity>

          {showMenu && (
            <View style={styles.menuContainer}>
              <ScrollView>
                {models.map((model) => (
                  <TouchableOpacity
                    key={model.name}
                    style={styles.menuItem}
                    onPress={() => {
                      console.log("Selected Model Name:", model.name);
                      const newModel = { ...model };
                      setSelectedModel(newModel);
                      resetARSession();
                      setShowMenu(false);
                      setShowAR(true);
                    }}
                  >
                    <Text style={styles.menuItemText}>{model.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      ) : (
        <View style={styles.menuContainer}>
          <Text style={styles.title}>Select a Model</Text>
          <ScrollView>
            {models.map((model) => (
              <TouchableOpacity
                key={model.name}
                style={styles.menuItem}
                onPress={() => {
                  setSelectedModel(model);
                  setShowAR(true);
                }}
              >
                <Text style={styles.menuItemText}>{model.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  arScene: { flex: 1 },
  menuButton: { position: "absolute", top: 20, right: 20, backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 5 },
  menuButtonText: { color: "white" },
  menuContainer: { position: "absolute", top: 60, left: 20, right: 20, backgroundColor: "#222", padding: 10, borderRadius: 5 },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20 },
  menuItem: { padding: 10, marginVertical: 5, backgroundColor: "#444", borderRadius: 5 },
  menuItemText: { color: "white" },
});
