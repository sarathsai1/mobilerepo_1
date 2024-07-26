import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { theme } from '../../../theme';
import defaults from '../../../styles/defaults';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type WelcomeBackHeaderProps = {
  userName?: string;
  profileImage?: string;
};

const WelcomeBackHeader: React.FC<WelcomeBackHeaderProps> = () => {
  const navigation = useNavigation<any>();
  const [userName, setUserName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const id = await AsyncStorage.getItem('Id'); // Assuming 'userId' is stored in AsyncStorage
          const api_url = `http://54.152.49.191:8080/register/professional/${id}`;
          const response = await axios.get(api_url, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          console.log("Response Data:", response.data);
          setUserName(response.data.name);
          setProfileImage(response.data.imageS3SignedURL);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUserData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerTitleContent}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
      <View style={styles.profileContent}>
        <View style={styles.notifyIcon}>
          <TouchableOpacity onPress={() => { navigation.navigate("Notification") }}>
            <Image source={require('../../../assets/icons/notification.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.imageUploadContent}>
          <TouchableOpacity style={styles.imageUploadBoxContent} onPress={() => { navigation.navigate("Profile") }}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../../assets/images/profile.png')}
              style={[defaults.image, styles.profileImage]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 25,
  },
  headerTitleContent: {},
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifyIcon: {
    marginRight: 10,
  },
  icon: {
    width: 34, // Set the size of your icon
    height: 34, // Set the size of your icon
    resizeMode: 'contain',
  },
  imageUploadContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageUploadBoxContent: {
    width: 70, // Reduced size
    height: 70, // Reduced size
    borderRadius: 35,
    backgroundColor: 'gray',
    position: 'relative',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },
});

export default WelcomeBackHeader;
