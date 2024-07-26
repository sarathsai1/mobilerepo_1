import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import RoundInput from '../../../components/inputs/RoundInput';
import RoundButton from '../../../components/buttons/RoundButton';
import FileUploadInput from '../../../components/inputs/FileUploadInput';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export type FormData = {
    companyName: string;
    clientName: string;
    clientPhoneNumber: string;
    clientEmail: string;
    clientGstNumber: string;
    clientGstForm: DocumentPickerResponse | null;
    clientPanCard: DocumentPickerResponse | null;
};

const AddClientForm = ({ onSubmit }: { onSubmit: (formData: FormData) => void }) => {
    const [formData, setFormData] = useState<FormData>({
        companyName: '',
        clientName: '',
        clientPhoneNumber: '',
        clientEmail: '',
        clientGstNumber: '',
        clientGstForm: null,
        clientPanCard: null,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [gstPdfFileName, setGstPdfFileName] = useState<string | null>(null);
    const [panOrVoterPdfFileName, setPanOrVoterPdfFileName] = useState<string | null>(null);
    const navigation = useNavigation<any>();

    const handleChange = (name: keyof FormData, value: string | DocumentPickerResponse | null) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
        validateField(name, value);
    };

    const validateField = (field: keyof FormData, value: string | DocumentPickerResponse | null) => {
        switch (field) {
            case 'companyName':
            case 'clientName':
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [field]: value ? '' : `${field} is required`,
                }));
                break;
            case 'clientPhoneNumber':
                const phoneRegex = /^[0-9]{10}$/;
                setErrors(prevErrors => ({
                    ...prevErrors,
                    clientPhoneNumber: phoneRegex.test(value as string) ? '' : 'Invalid phone number',
                }));
                break;
            case 'clientEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                setErrors(prevErrors => ({
                    ...prevErrors,
                    clientEmail: emailRegex.test(value as string) ? '' : 'Invalid email address',
                }));
                break;
            case 'clientGstNumber':
                const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                setErrors(prevErrors => ({
                    ...prevErrors,
                    clientGstNumber: gstRegex.test(value as string) ? '' : 'Invalid GST number',
                }));
                break;
            default:
                break;
        }
    };

    const handleUploadFile = async (fileType: 'gst' | 'pan') => {
        try {
            const result = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.pdf],
            });

            if (result && result.size > 5 * 1024 * 1024) {
                Alert.alert('File Size Exceeded', 'The file size exceeds the 5MB limit.');
                return;
            }

            if (fileType === 'gst') {
                handleChange('clientGstForm', result);
                setGstPdfFileName(result.name);
            } else {
                handleChange('clientPanCard', result);
                setPanOrVoterPdfFileName(result.name);
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('User cancelled the picker');
            } else {
                console.error('Unknown error: ', err);
                Alert.alert('Error', 'Failed to pick the document.');
            }
        }
    };

    const handleSubmit = async () => {
        const newErrors: { [key: string]: string } = {};
        let hasError = false;

        // Validate required fields
        ['companyName', 'clientName', 'clientPhoneNumber', 'clientEmail', 'clientGstNumber'].forEach(field => {
            if (!formData[field as keyof FormData]) {
                newErrors[field] = `${field} is required`;
                hasError = true;
            }
        });

        setErrors(newErrors);

        if (hasError) {
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('companyName', formData.companyName);
            formDataToSend.append('name', formData.clientName);
            formDataToSend.append('PhoneNumber', formData.clientPhoneNumber);
            formDataToSend.append('email', formData.clientEmail);
            formDataToSend.append('gstNumber', formData.clientGstNumber);

            const storedId = await AsyncStorage.getItem('Id');
            formDataToSend.append('professionalId', storedId || '');

            if (formData.clientGstForm) {
                formDataToSend.append('gstForm', {
                    uri: formData.clientGstForm.uri,
                    type: formData.clientGstForm.type,
                    name: formData.clientGstForm.name,
                } as any);
            }
            if (formData.clientPanCard) {
                formDataToSend.append('pan', {
                    uri: formData.clientPanCard.uri,
                    type: formData.clientPanCard.type,
                    name: formData.clientPanCard.name,
                } as any);
            }

            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.post('http://54.152.49.191:8080/client/saveClient', formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                const result = response.data;
                Alert.alert('Client added successfully!', '', [{ text: 'OK', onPress: () => navigation.navigate('Clients', { id: result.id }) }]);
                setFormData({
                    companyName: '',
                    clientName: '',
                    clientPhoneNumber: '',
                    clientEmail: '',
                    clientGstNumber: '',
                    clientGstForm: null,
                    clientPanCard: null,
                });
                onSubmit(formData);
            } else {
                throw new Error('Failed to add client');
            }
        } catch (error) {
            console.error('Error adding client:', error);
            Alert.alert('Failed to add client. Please try again.');
        }
    };

    return (
        <View style={styles.formContainer}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', height: 400 }}>
                <RoundInput
            placeholder="Company Name"
            value={formData.companyName}
            onChangeText={(value) => handleChange('companyName', value)}
            label=""
            editable
            error={errors.companyName} options={[]}                />
                <RoundInput
            placeholder="Client Name"
            value={formData.clientName}
            onChangeText={(value) => handleChange('clientName', value)}
            label=""
            editable
            error={errors.clientName} options={[]}                />
                <RoundInput
            placeholder="Client Phone Number"
            value={formData.clientPhoneNumber}
            onChangeText={(value) => handleChange('clientPhoneNumber', value)}
            label=""
            editable
            error={errors.clientPhoneNumber} options={[]}                />
                <RoundInput
            placeholder="Client Email Id"
            value={formData.clientEmail}
            onChangeText={(value) => handleChange('clientEmail', value)}
            label=""
            editable
            error={errors.clientEmail} options={[]}                />
                <RoundInput
            placeholder="Client GST Number"
            value={formData.clientGstNumber}
            onChangeText={(value) => handleChange('clientGstNumber', value)}
            label=""
            editable
            error={errors.clientGstNumber} options={[]}                />
                <FileUploadInput
            label="Client GST Form"
            uploadText="Upload Client GST Form"
            onPress={() => handleUploadFile('gst')}
            pdfFile={formData.clientGstForm}
            pdfFileName={gstPdfFileName}
            errorMessage={errors.clientGstForm ? 'GST Form is required' : ''} title={''} onUpload={function (file: any): void {
              throw new Error('Function not implemented.');
            } } file={null}                />
                <FileUploadInput
            label="Client Pan Card"
            uploadText="Upload Client Pan Card"
            onPress={() => handleUploadFile('pan')}
            pdfFile={formData.clientPanCard}
            pdfFileName={panOrVoterPdfFileName}
            errorMessage={errors.clientPanCard ? 'Pan Card is required' : ''} title={''} onUpload={function (file: any): void {
              throw new Error('Function not implemented.');
            } } file={null}                />
            </ScrollView>
            <RoundButton
                title="Submit"
                onPress={handleSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        width: '100%',
    },
    errorText: {
        color: 'red',
        marginTop: 5,
    },
});

export default AddClientForm;
