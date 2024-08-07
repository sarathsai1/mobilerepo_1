import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../../../../theme';
import defaults from '../../../../styles/defaults';
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
        const id = await AsyncStorage.getItem('Id');
        if (token && id) {
          const api_url = `http://54.152.49.191:8080/register/professional/${id}`;
          const response = await axios.get(api_url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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
        <Text style={styles.userName}>Employee Name</Text>
      </View>
      <View style={styles.profileContent}>
        <TouchableOpacity style={styles.notifyIcon} onPress={() => navigation.navigate("Notification")}>
          <Image source={require('../../../../assets/icons/notification.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          {/* <Image
            source={profileImage ? { uri: profileImage } : require('../../../../assets/images/profile.png')}
            style={[styles.profileImage]}
          /> */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifyIcon} onPress={() => navigation.navigate("Profile")}>
          <Image source={require('../../../../assets/icons/setting.png')} style={styles.icon} />
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  headerTitleContent: {
    flex: 1,
    justifyContent: 'center',
  },
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
  },
  notifyIcon: {
    marginRight: 10,
  },
  icon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: 'gray',
  },
});

export default WelcomeBackHeader;

