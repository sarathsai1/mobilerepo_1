import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, Text, View, Image, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  getHash,
  startOtpListener,
  useOtpVerify,
} from 'react-native-otp-verify';

import RoundInput from '../../components/inputs/RoundInput';
import RoundButton from '../../components/buttons/RoundButton';
import SocialMediaButton from '../../components/buttons/SocialMediaButton';
import BackGround from '../../components/BackGround';
import defaults from '../../styles/defaults';
import { theme } from '../../theme';
import { useAuth } from '../../services/firebaseAuthContext';
import useTabletStyle from "../../styles/TabStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userObj } from '../../storage/storageUser';

GoogleSignin.configure({
  webClientId: '244634140968-sva74pkqer9qq9cmk5har334hr2qsumf.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile'],
});

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const countryId = '+91';
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const { setConfirmationResult } = useAuth();
  const { isTablet, orientation, tabletStyle } = useTabletStyle();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    getHash().then(hash => {
      console.log(hash);
    }).catch(console.log);
  }, []);

  const handleLogin = async () => {
    const mobileNumberWithCountryId = countryId + phoneNumber;
    console.log("mobile", mobileNumberWithCountryId);

    try {
      const confirmationResult = await auth().signInWithPhoneNumber(mobileNumberWithCountryId);
      console.log('Confirmation result:', confirmationResult);
      setConfirmationResult(confirmationResult);
      navigation.navigate('OtpVerify', { mobileNumber: mobileNumberWithCountryId });
    } catch (error) {
      console.error('Phone number sign-in error:', (error as Error).message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;
      const accessToken = (await GoogleSignin.getTokens()).accessToken;

      if (!idToken || !accessToken) {
        throw new Error("Failed to retrieve idToken or accessToken");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('ID Token:', idToken);
      console.log('Access Token:', accessToken);

      const firebaseUser = await auth().signInWithCredential(googleCredential);
      const token = await firebaseUser.user.getIdToken();
      console.log("token", token);
      await AsyncStorage.setItem('authToken', token);

      if (firebaseUser) {
        userObj.name = firebaseUser.user.displayName || '';
        userObj.email = firebaseUser.user.email || '';
        userObj.userProfile = firebaseUser.user.photoURL || '';
        await AsyncStorage.setItem('sarath', JSON.stringify(userObj));
        console.log("Firebase User Email:", firebaseUser.user.email);
        console.log("Firebase User Name:", firebaseUser.user.displayName);
        console.log("Firebase User Profile Picture:", firebaseUser.user.photoURL);
        console.log("Access Token for further API calls:", accessToken);

        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Google Sign-In Error', (error as Error).message);
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    const phoneRegex = /^[0-9]{0,10}$/;

    if (phoneRegex.test(text)) {
      setPhoneNumber(text);
      setError('');
    } else {
      setError('Give valid phone number');
    }
  };

  return (
    <BackGround safeArea={true} style={defaults.flex}>
     
    
      <View style={[
        styles.container, 
        tabletStyle, 
        isTablet && orientation === 'vertical' ? { width: '70%', height: '50%', alignSelf: 'center' } : {}
      ]}>
         <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/logopp.png')} style={styles.logo} />
      </View>
        <View style={styles.titleContent}>
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.description}>Secure Account Login</Text>
        </View>

        <RoundInput
          label='Mobile Number'
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          editable={true}
          error={error}
          options={[]}
        />

        <RoundButton
          title='Log in'
          onPress={handleLogin}
          style={styles.fullWidthButton}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or Register with</Text>
          <View style={styles.divider} />
        </View>

        <SocialMediaButton 
          title='Log in with Google' 
          onPress={handleGoogleLogin} 
        />
      </View>
    </BackGround>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: -110,
   marginTop:-200,
    marginRight: 10,

  },
  logo: {
    width: 400,
    // height: 400,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: theme.colors.text,
  },
  description: {
    width: '70%',
    color: theme.colors.textSecondary,
  },
  titleContent: {
    marginBottom: 25,
  },
  fullWidthButton: {
    width: '100%',
    alignSelf: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderColor,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    marginHorizontal: 10,
  },
});

export default LoginScreen;
