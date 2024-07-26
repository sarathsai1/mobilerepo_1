import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { theme } from "../../../theme";

const ProfileCard: React.FC = () => {
    const [userName, setUserName] = useState<string>('');
    const [profileImage, setProfileImage] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        const getUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (token) {
                    const id = await AsyncStorage.getItem('Id'); // Assuming 'Id' is stored in AsyncStorage
                    if (id) {
                        const api_url = `http://54.152.49.191:8080/register/professional/${id}`;
                        const response = await axios.get(api_url, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        console.log("Response Data:", response.data);
                        setUserName(response.data.name);
                        setProfileImage(response.data.imageS3SignedURL);
                        setUserEmail(response.data.professionalEmail); // Assuming the API returns 'email'
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        getUserData();
    }, []);

    return (
        <View style={styles.cardContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                    source={profileImage ? { uri: profileImage } : require('../../../assets/images/profile.png')}
                    style={styles.profileImage}
                />
                <View>
                    <Text style={styles.nameText}>{userName}</Text>
                    <Text style={styles.emailText}>{userEmail}</Text>
                </View>
            </View>
            {/* Uncomment if edit icon is needed */}
            {/* <TouchableOpacity>
                <Image
                    source={require('../../../assets/icons/edit-2.png')}
                    style={styles.editIcon}
                />
            </TouchableOpacity> */}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 25,
        marginVertical: 25,
        position: 'relative',
        padding: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        marginRight: 20,
        borderRadius: 50,
    },
    nameText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    emailText: {
        color: 'black',
    },
    // Uncomment if edit icon is needed
    // editIcon: {
    //     width: 32,
    //     height: 32,
    // },
});

export default ProfileCard;
