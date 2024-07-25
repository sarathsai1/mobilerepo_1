import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import logo from '../assets/images/logo.png'; // Update the path to your logo file

const LoadingScreen: React.FC = () => {
    const navigation = useNavigation();

    useEffect(() => {
        // Set a timeout to navigate to the next screen after 3 seconds
        const timer = setTimeout(() => {
            // Replace 'NextScreen' with the name of the screen you want to navigate to
            navigation.navigate('NextScreen');
        }, 2000);

        // Clear the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <ActivityIndicator size="large" color="green" style={styles.spinner} />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D7E5D5',
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 20,
        marginRight: 30,
    },
    spinner: {
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        color: '#000',
    },
});

export default LoadingScreen;
