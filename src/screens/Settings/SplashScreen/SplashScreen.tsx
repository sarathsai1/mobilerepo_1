// SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      onFinish();
    }, 600000); // Adjust time as needed
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
      {/* <ActivityIndicator size="large" color="green" /> */}
      <Text style={styles.text}>Welcome to RDRTech</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white' // or any background color you prefer
  },
  logo: {
    width: 350,
    height: 300,
    resizeMode: 'contain',
    marginBottom: -10,
    marginLeft:0,
    marginRight:30,
    marginTop:-50,

  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color:"green"
  },
});

export default SplashScreen;
