// import React, { useState } from 'react';
// import { ScrollView, StyleSheet, View, Alert, Text } from 'react-native';
// import RoundInput from '../../../components/inputs/RoundInput';
// import RoundButton from '../../../components/buttons/RoundButton';
// import FileUploadInput from '../../../components/inputs/FileUploadInput';
// import DocumentPicker from 'react-native-document-picker';
// import { authAccessTonken } from '../../../services/Token';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// interface Employee {
//     id: number;
//     // add other properties here as needed
// }
// const AddEmployeeForm = ({ onSubmit }: { onSubmit: () => void }) => {
//     const navigation = useNavigation<any>();
//     const [employeeName, setEmployeeName] = useState('');
//     const [companyEmail, setCompanyEmail] = useState('');
//     const [personalEmail, setPersonalEmail] = useState('');
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [address, setAddress] = useState('');
//     const [city, setCity] = useState('');
//     const [country, setCountry] = useState('');
//     const [pinCode, setPinCode] = useState('');
//     const [expertise, setExpertise] = useState('');
//     const [role, setRole] = useState('');
//     const [adharCardFrontFile, setAdharCardFrontFile] = useState<any>(null);
//     const [adharCardBackFile, setAdharCardBackFile] = useState<any>(null);
//     const [panCardFile, setPanCardFile] = useState<any>(null);
//     const [formData, setFormData] = useState('');
//     const [errors, setErrors] = useState({
//         employeeName: '',
//         companyEmail: '',
//         personalEmail: '',
//         phoneNumber: '',
//         address: '',
//         city: '',
//         country: '',
//         pinCode: '',
//         expertise: '',
//         role: '',
//         adharCardFront: '',
//         adharCardBack: '',
//         panCard: '',
//     });

  

 
   

//     const handleSubmit = async () => {
//         if (validateForm()) {
//             const formData = new FormData();
//             formData.append('name', employeeName);
//             // console.log("employeename",employeeName);
//             formData.append('emailId', personalEmail);
//             formData.append('companyEmail', companyEmail);
//             formData.append('phoneNumber', phoneNumber);
//             formData.append('address', address);
//             formData.append('city', city);
//             formData.append('country', country);
//             formData.append('zipCode', pinCode);
//             formData.append('expertise', expertise);
//             formData.append('designation', role);
//             const storedId = await AsyncStorage.getItem('Id');
//             formData.append('professionalId', storedId);

//             if (adharCardFrontFile) {
//                 formData.append('adharFront', {
//                     uri: adharCardFrontFile.uri,
//                     type: adharCardFrontFile.type,
//                     name: adharCardFrontFile.name,
//                 });
//             }

//             if (adharCardBackFile) {
//                 formData.append('adharBack', {
//                     uri: adharCardBackFile.uri,
//                     type: adharCardBackFile.type,
//                     name: adharCardBackFile.name,
//                 });
//             }

//             if (panCardFile) {
//                 formData.append('employeePan', {
//                     uri: panCardFile.uri,
//                     type: panCardFile.type,
//                     name: panCardFile.name,
//                 });
//             }

//             try {
//                 const token = await AsyncStorage.getItem('authToken');
//                 if (!token) {
//                     throw new Error('Token not found');
//                 }
            
//                 const response = await fetch('http://54.152.49.191:8080/employee/save', {
//                     method: 'POST',
//                     body: formData,
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'multipart/form-data',
//                     },
//                 });
//             console.log(response);
//                 const textResponse = await response.text();
//                 console.log(textResponse);
//                 let result;
            
//                 try {
//                     result = JSON.parse(textResponse);
//                 } catch (jsonError) {
//                     console.error('Failed to parse JSON response:', jsonError);
//                     console.log('Raw response:', textResponse);
//                 }
            
//                 if (response.ok) {
//                     if (!result) {
//                         result = await response.json();
//                     }
//                     console.log('Add Employee successful:', result);
//                     await AsyncStorage.setItem('employeeId', JSON.stringify(result.id));
//                     console.log('Stored employeeId:', result.id);
//                     Alert.alert('Success', 'Add Employee successful', [
//                         {
//                             text: 'OK',
//                             onPress: () => navigation.navigate('Employees')
//                         }
//                     ]);
//                 } else {
//                     console.log('Response status:', response.status);
//                     Alert.alert('Error', 'Failed to register');
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 Alert.alert('Error', 'Failed to register');
//             }
//         }
//     };
//     return (
//         <View style={styles.formContainer}>
//             <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', height: 400 }}>
//                 <RoundInput
//                     placeholder="Employee Name"
//                     value={employeeName}
//                     onChangeText={(value) => handleChange('employeeName', value)}
//                     error={errors.employeeName} label={''} editable={true}  options={[]} />

//                 <RoundInput
//                     placeholder="Employee Company email"
//                     value={companyEmail}
//                     onChangeText={(value) => handleChange('companyEmail', value)}
//                     error={errors.companyEmail} label={''} editable={true}  options={[]} />

//                 <RoundInput
//                     placeholder="Employee Personal email"
//                     value={personalEmail}
//                     onChangeText={(value) => handleChange('personalEmail', value)}
//                     error={errors.personalEmail} label={''} editable={true} options={[]} />

//                 <RoundInput
//                     placeholder="Employee Phone Number"
//                     value={phoneNumber}
//                     onChangeText={(value) => handleChange('phoneNumber', value)}
//                     error={errors.phoneNumber} label={''} editable={true}  options={[]}
//                     maxLength={13} />

//                 <RoundInput
//                     placeholder="Employee Address"
//                     value={address}
//                     onChangeText={(value) => handleChange('address', value)}
//                     error={errors.address} label={''} editable={true}  options={[]} />

//                 <RoundInput
//                     placeholder="Employee City"
//                     value={city}
//                     onChangeText={(value) => handleChange('city', value)}
//                     error={errors.city} label={''} editable={true} options={[]} />

//                 <RoundInput
//                     placeholder="Employee Country"
//                     value={country}
//                     onChangeText={(value) => handleChange('country', value)}
//                     error={errors.country} label={''} editable={true}  options={[]} />

//                 <RoundInput
//                     placeholder="Employee Pin-Code"
//                     value={pinCode}
//                     onChangeText={(value) => handleChange('pinCode', value)}
//                     error={errors.pinCode} label={''} editable={true}  options={[]} />
//                 <FileUploadInput
//                     uploadText="Upload Adhar Card Front"
//                     file={adharCardFrontFile}
//                     onPress={() => handleFileUpload(setAdharCardFrontFile, (error: string) => setErrors({ ...errors, adharCardFront: error }))}
//                     pdfFile={adharCardFrontFile}
//                     pdfFileName={adharCardFrontFile?.name}
//                     errorMessage={errors.adharCardFront}
//                     onUpload={async () => { } } title={''}                />
//                 <FileUploadInput
//                     uploadText="Upload Adhar Card Back"
//                     file={adharCardBackFile}
//                     onPress={() => handleFileUpload(setAdharCardBackFile, (error: string) => setErrors({ ...errors, adharCardBack: error }))}
//                     pdfFile={adharCardBackFile}
//                     pdfFileName={adharCardBackFile?.name}
//                     errorMessage={errors.adharCardBack}
//                     onUpload={async () => { } } title={''}                />
//                 <FileUploadInput
//                     uploadText="Upload Pan Card"
//                     file={panCardFile}
//                     onPress={() => handleFileUpload(setPanCardFile, (error: string) => setErrors({ ...errors, panCard: error }))}
//                     pdfFile={panCardFile}
//                     pdfFileName={panCardFile?.name}
//                     errorMessage={errors.panCard}
//                     onUpload={async () => { } } title={''}                />

//                 <RoundInput
//                     placeholder="Employee Expertise"
//                     value={expertise}
//                     onChangeText={(value) => handleChange('expertise', value)}
//                     error={errors.expertise} label={''} editable={true} options={[]} />

//                 <RoundInput
//                     placeholder="Employee Role"
//                     value={role}
//                     onChangeText={(value) => handleChange('role', value)}
//                     error={errors.role} label={''} editable={true}  options={[]} />
//             </ScrollView>

//             <RoundButton
//                 title={'Submit'}
//                 onPress={handleSubmit}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     formContainer: {
//         width: '100%',
//     },
//     fileName: {
//         marginTop: 5,
//         marginBottom: 15,
//         color: 'gray',
//         fontSize: 12,
//     },
// });

// export default AddEmployeeForm;
