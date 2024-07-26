import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import BackGround from "../components/BackGround";
import RoundInput from "../components/inputs/RoundInput";
import RoundButton from "../components/buttons/RoundButton";
import { theme } from "../theme";
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import axios from 'axios';
import useTabletStyle from "../styles/TabStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyaccountScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [profileImage, setProfileImage] = useState<string>('');
    const [gstPdfFileName, setGstPdfFileName] = useState<string | null>(null);
    const [panOrVoterPdfFileName, setPanOrVoterPdfFileName] = useState<string | null>(null);
    const { isTablet, orientation, tabletStyle } = useTabletStyle();
    const [loading, setLoading] = useState<boolean>(true);
    const route = useRoute();
    const [id, setId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        personalEmail: '',
        phoneNumber: '',
        companyName: '',
        businessEmail: '',
        websiteLink: '',
        socialMediaLink: '',
        gstNumber: '',
        panNumber: '',
        address: '',
        city: '',
        country: '',
        pinCode: '',
        gstPdfFileName: '',
        panOrVoterPdfFileName: '',
        profileImage: '',
    });

    const [errors, setErrors] = useState({
        fullName: '',
        personalEmail: '',
        phoneNumber: '',
        companyName: '',
        businessEmail: '',
        websiteLink: '',
        socialMediaLink: '',
        gstNumber: '',
        panNumber: '',
        address: '',
        city: '',
        country: '',
        pinCode: '',
        gstPdfFileName: '',
        panOrVoterPdfFileName: '',
        profileImage: '',
    });

    useEffect(() => {
        const getID = async () => {
            try {
                const storedId = await AsyncStorage.getItem('Id');
                if (storedId !== null) {
                    console.log("AsyncStorage value", storedId);
                    setId(JSON.parse(storedId));
                }
            } catch (error) {
                console.error('Error retrieving item from AsyncStorage:', error);
            }
        };

        getID();
    }, []);

    useEffect(() => {
        if (id) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const api_url = `http://54.152.49.191:8080/register/professional/${id}`;
            const response = await axios.get(api_url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log("Response Data:", response.data);
            if (response.data) {
                const userData = response.data;
                setFormData({
                    fullName: userData.name || '',
                    personalEmail: userData.professionalEmail || '',
                    phoneNumber: userData.phoneNumber?.toString() || '',
                    companyName: userData.companyName || '',
                    businessEmail: userData.companyEmail || '',
                    websiteLink: userData.websiteLink || '',
                    socialMediaLink: userData.socialMediaLink || '',
                    gstNumber: userData.gstNumber || '',
                    panNumber: userData.panNumber || '',
                    address: userData.address || '',
                    city: userData.city || '',
                    country: userData.country || '',
                    pinCode: userData.pinCode?.toString() || '',
                    gstPdfFileName: userData.gstPdfFileName || '',
                    panOrVoterPdfFileName: userData.panOrVoterPdfFileName || '',
                    profileImage: userData.profileImage || '',
                });
                setProfileImage(userData.imageS3SignedURL || '');
                setGstPdfFileName(userData.gstFormS3SignedURL || '');
                setPanOrVoterPdfFileName(userData.panCardS3SignedURL || '');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const updateData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const api_url = `http://54.152.49.191:8080/register/professional`;
            const response = await axios.put(api_url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("Update Response Data:", response.data);
            Alert.alert('Success', 'Data updated successfully');
        } catch (error) {
            console.error('Error updating data:', error);
            Alert.alert('Error', 'Failed to update data');
        } finally {
            setLoading(false);
        }
    };

    const downloadAndOpenFile = async (url: string | null, fileName: string) => {
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        try {
            if (url) {
                const response = await RNFS.downloadFile({
                    fromUrl: url,
                    toFile: filePath,
                }).promise;

                if (response.statusCode === 200) {
                    await FileViewer.open(filePath);
                } else {
                    Alert.alert('Error', 'Failed to download file');
                }
            } else {
                Alert.alert('Error', 'Invalid file URL');
            }
        } catch (error) {
            console.error('File download error:', error);
            Alert.alert('Error', 'Failed to open file');
        }
    };

    const validateEmail = (email: string, field: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setErrors((prev) => ({ ...prev, [field]: 'Email is required' }));
        } else if (!emailRegex.test(email)) {
            setErrors((prev) => ({ ...prev, [field]: 'Invalid email format' }));
        } else {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validatePhoneNumber = (text: string) => {
        if (!text) {
            setErrors((prev) => ({ ...prev, phoneNumber: 'Phone Number is required' }));
        } else if (isNaN(Number(text)) || text.length < 10) {
            setErrors((prev) => ({ ...prev, phoneNumber: 'Invalid phone number' }));
        } else {
            setErrors((prev) => ({ ...prev, phoneNumber: '' }));
        }
    };

    const gstNumberRegex = /^[A-Za-z0-9]+$/; // Adjust this regex based on the actual format of GST numbers
    const panNumberRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // Example regex for PAN number format

    const validateGSTNumber = (text: string) => {
        if (!text) {
            setErrors((prev) => ({ ...prev, gstNumber: 'GST Number is required' }));
        } else if (!gstNumberRegex.test(text)) {
            setErrors((prev) => ({ ...prev, gstNumber: 'GST Number should only contain alphanumeric characters' }));
        } else {
            setErrors((prev) => ({ ...prev, gstNumber: '' }));
        }
    };

    const validatePanNumber = (text: string) => {
        if (!text) {
            setErrors((prev) => ({ ...prev, panNumber: 'PAN Number is required' }));
        } else if (!panNumberRegex.test(text)) {
            setErrors((prev) => ({ ...prev, panNumber: 'PAN Number should follow the format: 5 letters, 4 digits, 1 letter' }));
        } else {
            setErrors((prev) => ({ ...prev, panNumber: '' }));
        }
    };

    const handleChangeText = (field: keyof typeof formData, text: string) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: text,
        }));

        // Validate the field
        if (field === 'personalEmail' || field === 'businessEmail') {
            validateEmail(text, field);
        } else if (field === 'phoneNumber') {
            validatePhoneNumber(text);
        } else if (field === 'gstNumber') {
            validateGSTNumber(text);
        } else if (field === 'panNumber') {
            validatePanNumber(text);
        }
    };

    const fields = [
        { label: 'Full Name *', placeholder: 'Enter your name', value: formData.fullName, field: 'fullName', editable: false },
        { label: 'Personal Email *', placeholder: 'Enter your personal email', value: formData.personalEmail, field: 'personalEmail', editable: true },
        { label: 'Phone Number *', placeholder: 'Enter your phone number', value: formData.phoneNumber, field: 'phoneNumber', editable: true },
        { label: 'Company Name *', placeholder: 'Enter your company name', value: formData.companyName, field: 'companyName', editable: false },
        { label: 'Business Email *', placeholder: 'Enter your business email', value: formData.businessEmail, field: 'businessEmail', editable: true },
        { label: 'Website Link', placeholder: 'Enter your website link', value: formData.websiteLink, field: 'websiteLink', editable: false },
        { label: 'Social Media Link', placeholder: 'Enter your social media link', value: formData.socialMediaLink, field: 'socialMediaLink', editable: false },
        { label: 'GST Number *', placeholder: 'Enter your GST Number', value: formData.gstNumber, field: 'gstNumber', editable: true },
        { label: 'PAN Number *', placeholder: 'Enter your PAN Number', value: formData.panNumber, field: 'panNumber', editable: true },
        { label: 'Address', placeholder: 'Enter your address', value: formData.address, field: 'address', editable: false },
        { label: 'City *', placeholder: 'Enter your city', value: formData.city, field: 'city', editable: false },
        { label: 'Country *', placeholder: 'Enter your country', value: formData.country, field: 'country', editable: false },
        { label: 'Pin Code *', placeholder: 'Enter your pin code', value: formData.pinCode, field: 'pinCode', editable: false },
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <BackGround safeArea={true} style={styles.container}>
            <View style={[styles.content, tabletStyle, isTablet && orientation === 'vertical' ? { width: '70%', alignSelf: 'center' } : {}]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                        />
                    </View>
                    {fields.map((field, index) => (
                        <View key={index}>
                            <RoundInput
                                label={field.label}
                                placeholder={field.placeholder}
                                value={field.value}
                                editable={field.editable}
                                error={errors[field.field as keyof typeof errors]}
                                onChangeText={(text) => handleChangeText(field.field as keyof typeof formData, text)}
                                options={[]}
                                cursor={'default'}
                                style={field.editable ? {} : styles.readOnlyInput} // Apply style conditionally
                            />
                            {/* {errors[field.field as keyof typeof errors] ? (
                                <Text style={styles.errorText}>{errors[field.field as keyof typeof errors]}</Text>
                            ) : null} */}
                        </View>
                    ))}

                    <View style={styles.pdfContainer}>
                        {/* <Text style={styles.pdfLabel}>GST Registration Form</Text> */}
                        <View style={styles.pdfRow}>
                        <Text style={styles.pdfLabel}>GST Registration Form</Text>
                            {/* <Text style={styles.pdfFileName}>{gstPdfFileName || 'No file available'}</Text> */}
                            <TouchableOpacity onPress={() => downloadAndOpenFile(gstPdfFileName, 'gst-form.pdf')}>
                            <Image
                                    source={require('../assets/icons/invoice_download.png')}
                                    style={styles.invoiceIocn}
                                />
                                <Text>Invoice</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.pdfContainer}>
                       
                        <View style={styles.pdfRow}>
                        <Text style={styles.pdfLabel}>PAN/Voter Card</Text>
                            {/* <Text style={styles.pdfFileName}>GST FORM</Text> */}
                            {/* <Text style={styles.pdfFileName}>{panOrVoterPdfFileName || 'No file available'}</Text> */}
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <TouchableOpacity onPress={() => downloadAndOpenFile(panOrVoterPdfFileName, 'pan-voter-card.pdf')} >
                            <Image
                                    source={require('../assets/icons/invoice_download.png')}
                                    style={styles.invoiceIocn}
                                />
                                <Text>Invoice</Text>
                            </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <RoundButton
                        title="Update"
                        onPress={updateData}
                    />
                </ScrollView>
            </View>
        </BackGround>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    pdfContainer: {
        marginBottom: 18,
        color: theme.colors.primary,
    },
    pdfLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: "black",
    },
    pdfRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:"space-between"
    },
    pdfFileName: {
        flex: 1,
    },
    icon: {
        width: 45,
        height: 55,
    },
    readOnlyInput: {
        backgroundColor: '#f0f0f0',
        color: '#a0a0a0',
        marginLeft: -10,
        marginRight: -10,
        borderRadius: 19,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
    invoiceIocn:{
        width: 25,
        height: 25,
        
    }
});

export default MyaccountScreen;
