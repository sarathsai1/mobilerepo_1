import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TextInput, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BackGround from "../components/BackGround";
import defaults from "../styles/defaults";
import RoundInput from "../components/inputs/RoundInput";
import SocialMediaInput from "../components/inputs/SocialMediaInput";
import FileUploadInput from "../components/inputs/FileUploadInput";
import RoundButton from "../components/buttons/RoundButton";
import { theme } from "../theme";
import DocImageUpload from "../components/DocImageUpload";
import DocumentPicker from 'react-native-document-picker';
import { authAccessTonken } from '../services/Token';
import RNFS, {
  Fields,
  UploadBeginCallbackResult,
  UploadFileItem,
  UploadFileOptions,
  UploadProgressCallbackResult,
} from 'react-native-fs';
import useTabletStyle from "../styles/TabStyles";
import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  validateEmail,
  validateFullName,
  validateGstNumber,
  validateAddress,
  validateCity,
  validateCountry,
  validatePinCode,
  validateFileType,
  validatePanNumber
} from '../utils/validationUtils';
import { userObj } from "../storage/storageUser";
interface RegistrationResponse {
  id: number;
  // Add other properties if the response contains more fields
}
const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [profileImage, setProfileImage] = useState('');
  const [gstPdfFile, setGSTPdfFile] = useState<any | null>(null); // Update with correct type if necessary
  const [gstPdfFileName, setGstPdfFileName] = useState<string | null>('');
  const [panOrVoterPdfFile, setPanOrVoterPdfFile] = useState<any | null>(null); // Update with correct type if necessary
  const [panOrVoterPdfFileName, setPanOrVoterPdfFileName] = useState<string | null>('');
  const { isTablet, orientation, tabletStyle } = useTabletStyle();

  // Form fields states
  const [email, setEmail] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [socialMediaLink, setSocialMediaLink] = useState('');
  const [country, setCountry] = useState('');
  const [pinCode, setPinCode] = useState('');
  // const [gstPdfFileName, setGstPdfFileName] = useState('');
  // const [panOrVoterPdfFileName, setPanOrVoterPdfFileName] = useState('');
  // const [profileImage, setProfileImage] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [professionalId, setProfessionalId] = useState('');
  const [receivedId, setReceivedId] = useState(null);
  // const [websiteLink, setWebsiteLink] = useState('');
  // const [socialMediaLink, setSocialMediaLink] = useState('');
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  
const validateImageSize = async (uri: string) => {
  try {
    if (typeof uri !== 'string' || !uri.startsWith('file://')) {
      throw new Error('Invalid file URI format');
    }
    
    const stats = await RNFS.stat(uri);
    
    if (stats.size > MAX_FILE_SIZE) {
      setErrors({ profileImage: 'File size exceeds 5MB limit.' });
      return false;
    }
    
    setErrors({ profileImage: '' });
    return true;
  } catch (error) {
    console.error('Error checking file size:', error);
    setErrors({ profileImage: 'File size exceeds 5MB limit.' });
    return false;
  }
};

  const onChangeUploadImages = async (uri: string) => {
    const isValid = await validateImageSize(uri);
    if (!isValid) return null;

    const stats = await RNFS.stat(uri);
    let uploadedFile: any = '';
    if (typeof uri === 'string') {
      uploadedFile = {
        fileCopyUri: uri,
        size: stats.size,
        name: stats.name,
        type: 'image/jpeg',
        uri: stats.originalFilepath,
      };
    } else {
      uploadedFile = uri[0];
    }

    return uploadedFile;
  };

  const imageUploaded = async (uri: string, data?: any, metadata?: any) => {
    const isValid = await validateImageSize(uri);
    if (isValid) {
      setProfileImage(uri);
    }
    // You can also handle additional logic here if needed
  };

  const imagePicked = async (uri: string, data?: any, metadata?: any) => {
    const isValid = await validateImageSize(uri);
    if (isValid) {
      setProfileImage(uri);
       }
    // You can also handle additional logic here if needed
  };
  const handleUploadGSTPDF = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      const result = results[0];

      if (result.type !== 'application/pdf') {
        setErrors(prevErrors => ({
          ...prevErrors,
          gstPdfFileName: 'Please upload a valid PDF file for GST',
        }));
        return;
      }

      setGSTPdfFile(result);
      setGstPdfFileName(result.name);
      setErrors(prevErrors => ({ ...prevErrors, gstPdfFileName: '' }));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('Error uploading GST PDF:', err); // Improved error logging
      }
    }
  };

  const handleUploadPanOrVoterPDF = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      const result = results[0];

      if (result.type !== 'application/pdf') {
        setErrors(prevErrors => ({
          ...prevErrors,
          panOrVoterPdfFileName: 'Please upload a valid PDF file for PAN/Voter ID',
        }));
        return;
      }

      setPanOrVoterPdfFile(result);
      setPanOrVoterPdfFileName(result.name);
      setErrors(prevErrors => ({ ...prevErrors, panOrVoterPdfFileName: '' }));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('Error uploading PAN/Voter PDF:', err); // Improved error logging
      }
    }
  };
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const getUserData = async () => {
      try {
        const value = await AsyncStorage.getItem('sarath');
        if (value !== null) {
          console.log("AsyncStorage value", value);
          const userData = JSON.parse(value);

          setUserEmail(userData.email);
        }
      } catch (error) {
        console.error('Error retrieving item from AsyncStorage:', error);
      }
    };

    getUserData();
  }, []);

  const validateFields = () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: { [key: string]: string } = {};

    if (!fullName) newErrors.fullName = 'Full Name is required';
    if (!personalEmail || !isValidEmail.test(personalEmail)) newErrors.personalEmail = 'Valid Personal Email is required';
    if (!businessEmail || !isValidEmail.test(businessEmail)) newErrors.businessEmail = 'Valid Business Email is required';
    if (!phoneNumber || isNaN(Number(phoneNumber)) || phoneNumber.length < 10) newErrors.phoneNumber = 'Valid Phone Number is required';
    if (!companyName) newErrors.companyName = 'Company Name is required';
    if (!gstNumber) newErrors.gstNumber = 'GST Number is required';
    if (!address) newErrors.address = 'Address is required';
    if (!city) newErrors.city = 'City is required';
    if (!country) newErrors.country = 'Country is required';
    if (!pinCode) newErrors.pinCode = 'Pin Code is required';
    if (!panNumber) newErrors.panNumber = 'PAN Number is required';

    // Validate file uploads
    if (!profileImage) newErrors.profileImage = 'Profile Image is required';
    if (!gstPdfFile) newErrors.gstPdfFile = 'GST PDF is required';
    else if (gstPdfFile.type !== 'application/pdf') newErrors.gstPdfFile = 'GST PDF must be a PDF file';
    if (!panOrVoterPdfFile) newErrors.panOrVoterPdfFile = 'PAN/Voter PDF is required';
    else if (panOrVoterPdfFile.type !== 'application/pdf') newErrors.panOrVoterPdfFile = 'PAN/Voter PDF must be a PDF file';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleRegister = async () => {
    if (!validateFields()) {
      return; // If fields are not valid, do not proceed with the request
    }

    const formData = new FormData();
    formData.append('name', fullName);
    formData.append('professionalEmail', userEmail);
    formData.append('phoneNumber', phoneNumber);
    formData.append('companyName', companyName);
    formData.append('companyEmail', businessEmail);
    formData.append('websiteLink', websiteLink);
    formData.append('socialMediaLink', socialMediaLink);
    formData.append('gstNumber', gstNumber);
    formData.append('panNumber', panNumber);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('country', country);
    formData.append('pinCode', pinCode);

    if (profileImage) {
      const profileImageFile = {
        uri: profileImage,
        type: 'image/jpeg',
        name: 'profile.jpg'
      };
      formData.append('image', profileImageFile);
    }

    if (gstPdfFile) {
      formData.append('gstform', gstPdfFile);
    }

    if (panOrVoterPdfFile) {
      formData.append('pan', panOrVoterPdfFile);
    }

    console.log("dd", formData);

    try {
      // const token = await AsyncStorage.getItem('token');
      // console.log("erter",token);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://54.152.49.191:8080/register/professional', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });


      console.log("This is my formdata : ", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authAccessTonken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const textResponse = await response.text();
      console.log('Raw response:', textResponse);

      let result: RegistrationResponse;
      // try {
      //      result = JSON.parse(textResponse) as RegistrationResponse;

      //     console.log('Parsed response:', result);
      //     await AsyncStorage.setItem('professionalId', result.professionalId);
      //     console.log('id', professionalId)
      //     // const jsonResponse = await response.json();
      //     // console.log('Parsed JSON response:', jsonResponse);
      // } catch (jsonError) {
      //     console.log("This is my response : ", response);
      //     console.log("This is my status : ", response.status);

      // }
      // console.log("This is my response Backend : ", response);
      // console.log("This is my status : ", response.status);
      console.log(response);
      if (response.status == 200) {
        // const jsonResponse = await response.body;
        // console.log('Parsed JSON response:', jsonResponse);

        // console.log('Parsed JSON data response:', jsonResponse.data);
        // ...
        // console.log("This is my response",response.data );
        //  console.log("proffestionalid",result)
        console.log(response)

        result = JSON.parse(textResponse) as RegistrationResponse;

        console.log('Parsed response:', result.id);
        console.log("Registration successful:",);
        AsyncStorage.setItem('Id', JSON.stringify(result.id));
        // console.log(response.json);
        // console.log("ssss",id);
        Alert.alert('Success', 'Registration scessful', [{ text: 'OK', onPress: () => navigation.navigate('Approval', { id: result.id }) }])


        // console.log("ssss",id);
      } else if (response.status == 409) {
        // console.log("Registration 409 error:", result);
        Alert.alert('ERROR', 'plesae give valid phone numner/email id');
      }
      else if (response.status == 400) {
        // console.log("Registration 400 error:", result);
        Alert.alert('ERROR', 'plesae give valid phone');

      }
      else if (response.status == 404) {
        // console.log("Registration 404 error:", result);
        Alert.alert('ERROR', 'please give valid details');

      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to register');
    }

  };
  // const handleVerify = () => {
  //     navigation.navigate('Approval')
  // }


  const countryCode = '+91';

  function handleVerify(): void {
    throw new Error("Function not implemented.");
  }
  useEffect(() => {
    const getUserData = async () => {
      try {
        const value = await AsyncStorage.getItem('sarath');
        if (value !== null) {
          //console.log("AsyncStorage value", value);

          userObj.name = JSON.parse(value).fullName;
          userObj.email = JSON.parse(value).professionalEmail;
          userObj.userProfile = JSON.parse(value).userProfile;


        }
      } catch (error) {
        console.error('Error retrieving item from AsyncStorage:', error);
      }
    };

    getUserData();
  }, []);

  const validateFullName = (text: React.SetStateAction<string>) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, fullName: 'Full Name is required' }));


    } else {
      setErrors((prev) => ({ ...prev, fullName: '' }));
    }
    setFullName(text);
  };
  const validateCompanyName = (text: string) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, companyName: 'Company Name is required' }));
    } else {
      setErrors((prev) => ({ ...prev, companyName: '' }));
    }
    setCompanyName(text);
  };

  const validateEmail = (email: React.SetStateAction<string>, field: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors((prev) => ({ ...prev, [field]: 'Email is required' }));
    } else if (!emailRegex.test(String(email))) {
      setErrors((prev) => ({ ...prev, [field]: 'Invalid email format' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (field === 'userEmail') setUserEmail(email);
    if (field === 'businessEmail') setBusinessEmail(email);
  };

  const validatePhoneNumber = (text: number | any[] | React.SetStateAction<string>) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, phoneNumber: 'Phone Number is required' }));
    } else if (isNaN(text as number) || (text as string).length < 10) {
      setErrors((prev) => ({ ...prev, phoneNumber: 'Invalid phone number' }));
    } else {
      setErrors((prev) => ({ ...prev, phoneNumber: '' }));
    }
    setPhoneNumber(String(text));
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
    setGstNumber(text);
  };

  const validatePanNumber = (text: string) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, panNumber: 'PAN Number is required' }));
    } else if (!panNumberRegex.test(text)) {
      setErrors((prev) => ({ ...prev, panNumber: 'PAN Number should follow the format: 5 letters, 4 digits, 1 letter' }));
    } else {
      setErrors((prev) => ({ ...prev, panNumber: '' }));
    }
    setPanNumber(text);
  };
  const validateAddress = (text: React.SetStateAction<string>) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, address: 'Address is required' }));
    } else {
      setErrors((prev) => ({ ...prev, address: '' }));
    }
    setAddress(text);
  };

  const validateCity = (text: React.SetStateAction<string>) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, city: 'City is required' }));
    } else {
      setErrors((prev) => ({ ...prev, city: '' }));
    }
    setCity(text);
  };

  const validateCountry = (text: React.SetStateAction<string>) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, country: 'Country is required' }));
    } else {
      setErrors((prev) => ({ ...prev, country: '' }));
    }
    setCountry(text);
  };

  const validatePinCode = (text: number | any[] | React.SetStateAction<string>) => {
    if (!text) {
      setErrors((prev) => ({ ...prev, pinCode: 'Pin Code is required' }));
    } else if (isNaN(text as number) || (text as string).length !== 6) {
      setErrors((prev) => ({ ...prev, pinCode: 'Invalid pin code' }));
    } else {
      setErrors((prev) => ({ ...prev, pinCode: '' }));
    }
    setPinCode(String(text));
  };
  return (
    <BackGround safeArea={true} style={defaults.flex}>
      <View style={[styles.container, tabletStyle, isTablet && orientation === 'vertical' ? { width: '70%', height: 'auto', alignSelf: 'center' } : {}]}>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageUploadContent}>
      <TouchableOpacity style={styles.imageUploadBoxContent}>
        <DocImageUpload
        
          onImageUploaded={imageUploaded}
          onImagePicked={imagePicked}
          upload={false}
          width={200}
          height={200}
          fileType={"images"}
        >
          <View style={{ width: 120, height: 120, borderRadius: 100, overflow: "hidden" }}>
            {profileImage ? (
              <Image
                key={profileImage}
                source={{ uri: profileImage }}
                style={styles.image}
              />
            ) : (
              <Image
                source={require('../assets/images/profile.png')}
                style={styles.image}
              />
            )}
          </View>
        </DocImageUpload>

        <View style={styles.cameraIconContent}>
          <Image
            source={require('../assets/icons/camera.png')}
            style={styles. cameraIconContent}
          />
        </View>
      </TouchableOpacity>

      
    </View>
    
    {errors.profileImage && <Text style={styles.error}>{errors.profileImage}</Text>}
  

          <RoundInput
            label="Full Name *"
            placeholder="Enter your name"
            value={fullName}
            onChangeText={validateFullName}

            editable={true}
            error={errors.fullName}
            options={[]}
          />

          <RoundInput
            label="Personal Email *"
            placeholder="Enter your personal email"
            value={userEmail}
            onChangeText={(text) => validateEmail(text, 'userEmail')}

            editable={true}
            error={errors.userEmail}
            options={[]}
          />

          <RoundInput
            label={`Phone Number(${countryCode}) *`}
            placeholder={`Enter your phone number (${countryCode})`}
            value={phoneNumber}
            onChangeText={(validatePhoneNumber)}
            maxLength={13}
            editable={true}
            error={errors.phoneNumber}
            options={[]}
          />

          <RoundInput
            label="Company Name *"
            placeholder="Enter your company name"
            value={companyName}
            onChangeText={validateCompanyName} // Use validateCompanyName function here
            editable={true}
            error={errors.companyName} // Make sure the error is correctly mapped
            options={[]}
          />


          <RoundInput
            label="Business Email *"
            placeholder="Enter your business email"
            value={businessEmail}
            onChangeText={(text) => validateEmail(text, 'businessEmail')}

            editable={true}
            error={errors.businessEmail}
            options={[]}
          />

          <RoundInput
            label="GST Number *"
            placeholder="Enter your GST Number"
            value={gstNumber}
            onChangeText={validateGSTNumber}

            editable={true}
            error={errors.gstNumber}
            options={[]}
          />

          <RoundInput
            label="PAN Number *"
            placeholder="Enter your PAN Number"
            value={panNumber}
            onChangeText={validatePanNumber}
            editable={true}
            error={errors.panNumber}
            options={[]}
          />

        <View>
      <FileUploadInput
        label='GST Registration Form'
        uploadText='Upload GST Form'
        onPress={handleUploadGSTPDF}
        pdfFile={gstPdfFile}
        pdfFileName={gstPdfFileName}
        errorMessage={errors.gstPdfFileName}
        title=""
        file={null}
        onUpload={async () => {}}
      />
{errors.gstPdfFile && <Text style={styles.error}>{errors.gstPdfFile}</Text>}
      <FileUploadInput
        label='Pan Card *'
        uploadText='Upload Voter Card/Pan Card'
        onPress={handleUploadPanOrVoterPDF}
        pdfFile={panOrVoterPdfFile}
        pdfFileName={panOrVoterPdfFileName}
        errorMessage={errors.panOrVoterPdfFileName}
        title=""
        file={null}
        onUpload={async () => {}}
      />
      {errors.panOrVoterPdfFile && <Text style={styles.error}>{errors.panOrVoterPdfFile}</Text>}
    </View>
          <RoundInput
            label='Address *'
            placeholder="Enter your address"
            value={address}
            onChangeText={validateAddress}
            error={errors.address} editable={true} options={[]} />

          <RoundInput
            label='City *'
            placeholder="Enter your city"
            value={city}
            onChangeText={validateCity}
            error={errors.city} editable={true} options={[]} />

          <RoundInput
            label='Country *'
            placeholder="Enter your country"
            value={country}
            onChangeText={validateCountry}
            error={errors.country} editable={true} options={[]} />

          <RoundInput
            label='Pin Code *'
            placeholder="Enter your pin code"
            value={pinCode}
            onChangeText={validatePinCode}
            error={errors.pinCode} editable={true} options={[]} />
        </ScrollView>

        <View style={styles.registrationContent}>
          <RoundButton
            title={'Register'}
            onPress={handleRegister}
            style={styles.fullWidthButton}
          // onPress={handleVerify}
          />
        </View>
      </View>
    </BackGround >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  imageUploadContent: {
    marginVertical: 25,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  imageUploadBoxContent: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: 'gray',
    position: 'relative'
  },

  cameraIconContent: {
    width: 35,
    height: 35,
    position: 'absolute',
    bottom: 0,
    right: 8,
  },
 
  image: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    width: 30,
    height: 30,
  },
  registrationContent: {
    width: '100%',
    paddingVertical: 30,
    backgroundColor: theme.colors.background
  },

  fullWidthButton: {
    width: '100%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  error: {
    color: 'red',
    fontSize: 16,
    marginTop: -10,
    textAlign: 'center',
  },

})

export default RegistrationScreen;

function setUserName(name: any) {
  throw new Error("Function not implemented.");
}
function validateFields() {
  throw new Error("Function not implemented.");
}

