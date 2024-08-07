import React, { useState } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RoundInput from "../../../../../../components/inputs/RoundInput";
import RoundButton from "../../../../../../components/buttons/RoundButton";

const UpdateStatus: React.FC = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const navigation = useNavigation();

    const handleChange = (text: string): void => {
        setInputValue(text);
    };

    const handleSubmit = async (): Promise<void> => {
        try {
            setLoading(true);
            const storedId = await AsyncStorage.getItem('projectId');
            const token = await AsyncStorage.getItem('authToken');
            
            if (storedId !== null && token !== null) {
                const id = JSON.parse(storedId);
                const response = await fetch(`http://54.152.49.191:8080/project/projectPayment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        projectId: id,
                        dueAmount: parseFloat(inputValue),
                    }),
                });

                console.log(response);
                console.log('API response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setMessage(data);
                    setInputValue('');
                    setTimeout(() => {
                        setMessage(null);
                        // navigation.navigate('PaymentHistory'); // Replace 'PaymentHistory' with your actual payment history screen name
                    }, 2000);
                } else {
                    setError('Failed to update project status');
                }
            } else {
                setError('Project ID or Token not found');
            }
        } catch (error) {
            console.error('Error updating project status:', error);
            setError('Error updating project status');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <Text>{error}</Text>;
    }

    return (
        <View style={styles.container}>
            
            <RoundInput
                placeholder="Feb, Due Amount: ₹250"
                value={inputValue}
                onChangeText={handleChange}
                label={""}
                editable={true}
                error={""}
                options={[]}
                
            />
            {message && <Text style={styles.successMessage}>{message}</Text>}
            
            <RoundButton
                title={'Update Status'}
                onPress={handleSubmit}
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    successMessage: {
        color: 'green',
        marginBottom: 8,
    },
});

export default UpdateStatus;
