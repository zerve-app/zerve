import { View, Text } from "react-native";
import { Button } from "ui";
import {useAction} from 'agent-react'

export default function Web() {
  const changeScene = useAction('ChangeScene')
  return (
    <View style={{ backgroundColor: "lightblue", flex: 1 }}>
      <Text>Control</Text>
      <Button title="Set scene to camera" onPress={() => {
        changeScene({ sceneKey: 'Camera' })
      }} />
    </View>
  );
}
