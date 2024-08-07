import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../../../../../theme';

type PaymentHistoryDataItem = {
    paymentDate: string;
    paymentAmount: number;
    paymentDescription: string;
};

const PaymentHistory: React.FC = () => {
    const [paymentHistoryData, setPaymentHistoryData] = useState<PaymentHistoryDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPaymentHistory = async () => {
        try {
            const storedId = await AsyncStorage.getItem('projectId');
            const token = await AsyncStorage.getItem('authToken');

            if (storedId !== null && token !== null) {
                const id = JSON.parse(storedId);
                const response = await fetch(`http://54.152.49.191:8080/project/${id}/details`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                const data = result.projectPaymentList.map((item: any) => ({
                    paymentDate: item.paymentDate,
                    paymentAmount: item.paymentAmount,
                    paymentDescription: item.paymentDescription,
                }));

                setPaymentHistoryData(data);
            } else {
                setError('Missing project ID or auth token');
            }
        } catch (err) {
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentHistory(); // Initial fetch

        const intervalId = setInterval(() => {
            fetchPaymentHistory(); // Polling every 10 seconds
        }, 10000);

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    const PaymentHistoryItem: React.FC<PaymentHistoryDataItem> = ({ paymentDate, paymentAmount, paymentDescription }) => (
        <View style={styles.itemContainer}>
            <Image source={require('../../../../../../assets/icons/tick-circle.png')} />
            <View style={styles.textContainer}>
                <Text style={styles.descriptionText}>{paymentDescription}</Text>
                <Text style={styles.dateText}>{paymentDate}</Text>
            </View>
            <Text style={styles.amountText}>{`₹${paymentAmount}`}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.nameOfTitle}>Payment History:</Text>
            <FlatList
                data={paymentHistoryData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <PaymentHistoryItem {...item} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    nameOfTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    dateText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    descriptionText: {
        fontSize: 14,
        color: 'grey',
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
    },
});

export default PaymentHistory;
