import { useNavigation } from '@react-navigation/native'

import { Pressable, StyleSheet, View } from 'react-native'
import { modalWidth } from './utils'

export const initModalOverlay = (WrappedComponent) => {
  return (props) => {
    const navigation = useNavigation()
    return (
      <View
        style={{
          flex: 1,
          // alignItems: 'center',
          // justifyContent: 'flex-end',
        }}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          ]}
          onPress={() => {
            navigation.goBack()
          }}
        />
        <div
          style={{
            alignSelf: 'end',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: modalWidth,
          }}
        >
          <WrappedComponent {...props} />
        </div>
      </View>
    )
  }
}
