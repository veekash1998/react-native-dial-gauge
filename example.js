import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import CircularDialGauge from './index';

const ExampleApp = () => {
    const [voltage, setVoltage] = useState(220);
    const [current, setCurrent] = useState(15);
    const [temperature, setTemperature] = useState(25);

    useEffect(() => {
        const interval = setInterval(() => {
            setVoltage(200 + Math.random() * 50);
            setCurrent(10 + Math.random() * 20);
            setTemperature(20 + Math.random() * 15);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>React Native Dial Gauge Examples</Text>

            {/* Basic Example */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Usage</Text>
                <CircularDialGauge
                    value={75}
                    maxValue={100}
                    title="Progress"
                    unit="%"
                />
            </View>

            {/* Dashboard Example */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dashboard Gauges</Text>
                <View style={styles.row}>
                    <CircularDialGauge
                        value={voltage}
                        maxValue={250}
                        minValue={200}
                        title="Voltage"
                        unit="V"
                        color="#FF6B35"
                        width={150}
                        containerStyle={styles.gaugeCard}
                    />
                    <CircularDialGauge
                        value={current}
                        maxValue={32}
                        minValue={0}
                        title="Current"
                        unit="A"
                        color="#4ECDC4"
                        width={150}
                        containerStyle={styles.gaugeCard}
                    />
                </View>
            </View>

            {/* Custom Styling */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Custom Styling</Text>
                <CircularDialGauge
                    value={temperature}
                    maxValue={40}
                    minValue={0}
                    title="Temperature"
                    unit="°C"
                    color="#E74C3C"
                    backgroundColor="#FADBD8"
                    textColor="#C0392B"
                    secondaryTextColor="#E74C3C"
                    decimalPlaces={1}
                    containerStyle={styles.customGauge}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#2c3e50',
    },
    section: {
        margin: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#34495e',
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    gaugeCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    customGauge: {
        backgroundColor: '#FEF9E7',
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: '#F7DC6F',
    },
});

export default ExampleApp;