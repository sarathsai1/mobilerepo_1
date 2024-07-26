import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import RoundInput from '../../../components/inputs/RoundInput';
import RoundButton from '../../../components/buttons/RoundButton';
import FileUploadInput from '../../../components/inputs/FileUploadInput';
import DocumentPicker from 'react-native-document-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddEmployeeForm = ({ onSubmit }: { onSubmit: () => void }) => {
    const navigation = useNavigation<any>();
    const [employeeName, setEmployeeName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [personalEmail, setPersonalEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [expertise, setExpertise] = useState('');
    const [role, setRole] = useState('');
    const [adharCardFrontFile, setAdharCardFrontFile] = useState<any>(null);
    const [adharCardBackFile, setAdharCardBackFile] = useState<any>(null);
    const [panCardFile, setPanCardFile] = useState<any>(null);
    const [errors, setErrors] = useState({
        employeeName: '',
        companyEmail: '',
        personalEmail: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        pinCode: '',
        expertise: '',
        role: '',
        adharCardFront: '',
        adharCardBack: '',
        panCard: '',
    });

    const validateField = (field: string, value: string) => {
        switch (field) {
            case 'employeeName':
                return value ? '' : 'Employee Name is required';
            case 'companyEmail':
                return !value ? 'Company Email is required' :
                       !validateEmailFormat(value) ? 'Invalid email format' : '';
            case 'personalEmail':
                return !value ? 'Personal Email is required' :
                       !validateEmailFormat(value) ? 'Invalid email format' : '';
            case 'phoneNumber':
                return !value ? 'Phone Number is required' :
                       !validatePhoneNumber(value) ? 'Invalid phone number' : '';
            case 'address':
                return value ? '' : 'Address is required';
            case 'city':
                return value ? '' : 'City is required';
            case 'country':
                return value ? '' : 'Country is required';
            case 'pinCode':
                return !value ? 'Pin Code is required' :
                       !validatePinCode(value) ? 'Invalid pin code' : '';
            case 'expertise':
                return value ? '' : 'Expertise is required';
            case 'role':
                return value ? '' : 'Role is required';
            case 'adharCardFront':
                return adharCardFrontFile ? '' : 'Adhar Card Front is required';
            case 'adharCardBack':
                return adharCardBackFile ? '' : 'Adhar Card Back is required';
            case 'panCard':
                return panCardFile ? '' : 'Pan Card is required';
            default:
                return '';
        }
    };

    const handleChange = (field: string, value: string) => {
        const newErrors = { ...errors, [field]: validateField(field, value) };
        setErrors(newErrors);

        switch (field) {
            case 'employeeName':
                setEmployeeName(value);
                break;
            case 'companyEmail':
                setCompanyEmail(value);
                break;
            case 'personalEmail':
                setPersonalEmail(value);
                break;
            case 'phoneNumber':
                setPhoneNumber(value);
                break;
            case 'address':
                setAddress(value);
                break;
            case 'city':
                setCity(value);
                break;
            case 'country':
                setCountry(value);
                break;
            case 'pinCode':
                setPinCode(value);
                break;
            case 'expertise':
                setExpertise(value);
                break;
            case 'role':
                setRole(value);
                break;
            default:
                break;
        }
    };

    const handleFileUpload = async (setter: (file: any) => void, errorSetter: (error: string) => void) => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            setter(result[0]);
            errorSetter('');
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                console.error(err);
                errorSetter('Failed to select file');
            }
        }
    };

    const validateEmailFormat = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone: string) => {
        return !isNaN(Number(phone)) && phone.length >= 10;
    };

    const validatePinCode = (pin: string) => {
        return !isNaN(Number(pin)) && pin.length === 6;
    };

    const handleSubmit = async () => {
        const formErrors = {
            employeeName: validateField('employeeName', employeeName),
            companyEmail: validateField('companyEmail', companyEmail),
            personalEmail: validateField('personalEmail', personalEmail),
            phoneNumber: validateField('phoneNumber', phoneNumber),
            address: validateField('address', address),
            city: validateField('city', city),
            country: validateField('country', country),
            pinCode: validateField('pinCode', pinCode),
            expertise: validateField('expertise', expertise),
            role: validateField('role', role),
            adharCardFront: validateField('adharCardFront', ''),
            adharCardBack: validateField('adharCardBack', ''),
            panCard: validateField('panCard', ''),
        };

        setErrors(formErrors);

        if (Object.values(formErrors).some(error => error)) {
            return; // Stop if there are validation errors
        }

        const formData = new FormData();
        formData.append('name', employeeName);
        formData.append('emailId', personalEmail);
        formData.append('companyEmail', companyEmail);
        formData.append('phoneNumber', phoneNumber);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('country', country);
        formData.append('zipCode', pinCode);
        formData.append('expertise', expertise);
        formData.append('designation', role);
        const storedId = await AsyncStorage.getItem('Id');
        formData.append('professionalId', storedId || '');

        if (adharCardFrontFile) {
            formData.append('adharFront', {
                uri: adharCardFrontFile.uri,
                type: adharCardFrontFile.type,
                name: adharCardFrontFile.name,
            });
        }

        if (adharCardBackFile) {
            formData.append('adharBack', {
                uri: adharCardBackFile.uri,
                type: adharCardBackFile.type,
                name: adharCardBackFile.name,
            });
        }

        if (panCardFile) {
            formData.append('employeePan', {
                uri: panCardFile.uri,
                type: panCardFile.type,
                name: panCardFile.name,
            });
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Token not found');
            }

            const response = await fetch('http://54.152.49.191:8080/employee/save', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);

            const textResponse = await response.text();
            let result;

            try {
                result = JSON.parse(textResponse);
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                console.log('Raw response:', textResponse);
                result = { id: null }; // Default to null if parsing fails
            }

            if (response.ok) {
                if (!result.id) {
                    result = await response.json();
                }
                console.log('Add Employee successful:', result);
                await AsyncStorage.setItem('employeeId', JSON.stringify(result.id));
                console.log('Stored employeeId:', result.id);
                Alert.alert('Success', 'Add Employee successful', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Employees')
                    }
                ]);
            } else {
                console.log('Response status:', response.status);
                Alert.alert('Error', 'Failed to register');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    return (
        <View style={styles.formContainer}>
            <ScrollView showsVerticalScrollIndicator={true} style={{ width: '100%', height: 400 }}>
                <RoundInput
                    placeholder="Employee Name"
                    value={employeeName}
                    onChangeText={(value) => handleChange('employeeName', value)}
                    error={errors.employeeName} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee Company Email"
                    value={companyEmail}
                    onChangeText={(value) => handleChange('companyEmail', value)}
                    error={errors.companyEmail} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee Personal Email"
                    value={personalEmail}
                    onChangeText={(value) => handleChange('personalEmail', value)}
                    error={errors.personalEmail} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee Phone Number"
                    value={phoneNumber}
                    onChangeText={(value) => handleChange('phoneNumber', value)}
                    error={errors.phoneNumber}
                    maxLength={13} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee Address"
                    value={address}
                    onChangeText={(value) => handleChange('address', value)}
                    error={errors.address} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee City"
                    value={city}
                    onChangeText={(value) => handleChange('city', value)}
                    error={errors.city} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee Country"
                    value={country}
                    onChangeText={(value) => handleChange('country', value)}
                    error={errors.country} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee Pin-Code"
                    value={pinCode}
                    onChangeText={(value) => handleChange('pinCode', value)}
                    error={errors.pinCode} label={''} editable={true} options={[]}                />
                <FileUploadInput
                    uploadText="Upload Adhar Card Front"
                    file={adharCardFrontFile}
                    onPress={() => handleFileUpload(setAdharCardFrontFile, (error: string) => setErrors({ ...errors, adharCardFront: error }))}
                    pdfFile={adharCardFrontFile}
                    pdfFileName={adharCardFrontFile?.name}
                    errorMessage={errors.adharCardFront} title={''} onUpload={function (file: any): void {
                        throw new Error('Function not implemented.');
                    } }                />
                <FileUploadInput
                    uploadText="Upload Adhar Card Back"
                    file={adharCardBackFile}
                    onPress={() => handleFileUpload(setAdharCardBackFile, (error: string) => setErrors({ ...errors, adharCardBack: error }))}
                    pdfFile={adharCardBackFile}
                    pdfFileName={adharCardBackFile?.name}
                    errorMessage={errors.adharCardBack} title={''} onUpload={function (file: any): void {
                        throw new Error('Function not implemented.');
                    } }                />
                <FileUploadInput
                    uploadText="Upload Pan Card"
                    file={panCardFile}
                    onPress={() => handleFileUpload(setPanCardFile, (error: string) => setErrors({ ...errors, panCard: error }))}
                    pdfFile={panCardFile}
                    pdfFileName={panCardFile?.name}
                    errorMessage={errors.panCard} title={''} onUpload={function (file: any): void {
                        throw new Error('Function not implemented.');
                    } }                />
                <RoundInput
                    placeholder="Employee Expertise"
                    value={expertise}
                    onChangeText={(value) => handleChange('expertise', value)}
                    error={errors.expertise} label={''} editable={true} options={[]}                />
                <RoundInput
                    placeholder="Employee Role"
                    value={role}
                    onChangeText={(value) => handleChange('role', value)}
                    error={errors.role} label={''} editable={true} options={[]}                />
            </ScrollView>
            <RoundButton
                title={'Submit'}
                onPress={handleSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        width: '100%',
    },
});

export default AddEmployeeForm;
