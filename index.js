/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import firebase from '@react-native-firebase/app';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: '244634140968-sva74pkqer9qq9cmk5har334hr2qsumf.apps.googleusercontent.com',
});

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPI_Kc5Hw26bXYp1fKLBNUyPfPe4ivjTM",
    authDomain: "rdrtech-project.firebaseapp.com",
    projectId: "rdrtech-project",
    storageBucket: "rdrtech-project.appspot.com",
    messagingSenderId: "244634140968",
    appId: "1:244634140968:android:92681c81ebf5f2e5f4d01d",
    measurementId: "G-JZYLLM6HL4"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log(firebase.initializeApp + 'inside')
}



AppRegistry.registerComponent(appName, () => App);

