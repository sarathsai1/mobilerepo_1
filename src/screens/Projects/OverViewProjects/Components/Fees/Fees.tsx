import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../../../../theme";
import PaymentHistory from "./Components/PaymentHistory";
import AmountReminder from "./Components/AmountReminder";
import UpdateStatus from "./Components/UpdateStatus";

const Fees: React.FC = () => {
    const [totalAmount, setTotalAmount] = useState<number | null>(null);
    const [dueAmount, setDueAmount] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjectDetails = async () => {
        try {
            const storedId = await AsyncStorage.getItem('projectId');
            const token = await AsyncStorage.getItem('authToken');
            console.log('Retrieved projectId:', storedId);
            console.log('Retrieved authToken:', token);

            if (storedId !== null && token !== null) {
                const id = JSON.parse(storedId);
                const response = await fetch(`http://54.152.49.191:8080/project/${id}/details`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('API response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    setTotalAmount(data.projectTotalAmount);
                    setDueAmount(data.overallDueAmount);
                } else {
                    setError('Failed to fetch project details');
                }
            } else {
                setError('Project ID or Token not found');
            }
        } catch (error) {
            console.error('Error retrieving project details:', error);
            setError('Error retrieving project details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails(); // Initial fetch

        const intervalId = setInterval(() => {
            fetchProjectDetails(); // Polling every 10 seconds
        }, 10000);

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
        return <Text>{error}</Text>;
    }

    return (
        <View style={styles.cardContent}>
            <Text style={styles.nameText}>Fees</Text>

            <View style={styles.feeAmountContent}>
                <View style={styles.amountTextContent}>
                    <Text style={styles.amountNameText}>Total Amount</Text>
                    <Text style={styles.amountText}>₹{totalAmount}</Text>
                </View>

                <View style={styles.amountTextContent}>
                    <Text style={styles.amountNameText}>Due Amount</Text>
                    <Text style={styles.amountText}>₹{dueAmount}</Text>
                </View>
            </View>

            <PaymentHistory />

            <AmountReminder />

            <UpdateStatus />
        </View>
    );
};

const styles = StyleSheet.create({
    cardContent: {
        backgroundColor: theme.colors.secondary,
        borderRadius: 25,
        marginVertical: 10,
        position: 'relative',
        padding: 20,
    },

    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },

    feeAmountContent: {
        margin: 20,
    },

    amountTextContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5
    },

    amountNameText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '500'
    },

    amountText: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default Fees;
