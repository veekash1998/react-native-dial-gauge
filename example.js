import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import CircularDialGauge from './index';

const ExampleApp = () => {
  // Real-time telemetry simulation
  const [speed, setSpeed] = useState(65);
  const [battery, setBattery] = useState(82);
  const [temp, setTemp] = useState(36.5);
  const [interactiveVal, setInteractiveVal] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(40 + Math.floor(Math.random() * 60));
      setBattery((prev) => Math.max(10, Math.min(100, prev + (Math.random() * 4 - 2))));
      setTemp(30 + Math.random() * 15);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>React Native Dial Gauge v2.0</Text>
        <Text style={styles.subHeader}>Modern • Responsive • Interactive • Multi-variant</Text>

        {/* 1. Interactive Touch & Drag Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👆 Interactive Gauge (Touch & Drag)</Text>
          <Text style={styles.cardDesc}>Touch and drag the needle to adjust value in real time:</Text>
          <CircularDialGauge
            value={interactiveVal}
            minValue={0}
            maxValue={100}
            title="User Control"
            unit="%"
            variant="semicircle"
            size={220}
            interactive={true}
            step={1}
            color="#6366F1"
            needleType="triangle"
            needleColor="#4F46E5"
            onValueChange={(val) => setInteractiveVal(val)}
            containerStyle={styles.gaugeContainer}
          />
          <Text style={styles.feedbackText}>
            Current Value: <Text style={styles.highlightText}>{interactiveVal.toFixed(0)}%</Text>
          </Text>
        </View>

        {/* 2. Automotive Speedometer with Multi-color Zones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏎️ Speedometer with Color Zones</Text>
          <Text style={styles.cardDesc}>270° sweep angle with Safe, Warning, and Danger threshold bands:</Text>
          <CircularDialGauge
            variant="speedometer"
            value={speed}
            minValue={0}
            maxValue={160}
            title="Vehicle Speed"
            unit="km/h"
            size={240}
            needleType="needle"
            needleColor="#1E293B"
            ranges={[
              { from: 0, to: 80, color: '#10B981', label: 'Safe' },
              { from: 80, to: 120, color: '#F59E0B', label: 'Warning' },
              { from: 120, to: 160, color: '#EF4444', label: 'Danger' },
            ]}
            majorTickCount={9}
            minorTicksPerInterval={3}
            containerStyle={styles.gaugeContainer}
          />
        </View>

        {/* 3. Modern Linear Gradient Arc */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ Modern Gradient Gauge</Text>
          <Text style={styles.cardDesc}>Smooth SVG color gradient along the progress arc:</Text>
          <CircularDialGauge
            value={battery}
            minValue={0}
            maxValue={100}
            title="Battery State"
            unit="%"
            size={200}
            variant="semicircle"
            gradientColors={['#06B6D4', '#10B981']}
            needleType="needle"
            needleColor="#0891B2"
            containerStyle={styles.gaugeContainer}
          />
        </View>

        {/* 4. Full Circle 360° Minimalist Dial */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⭕ 360° Circular Activity Ring</Text>
          <Text style={styles.cardDesc}>Orbital dot indicator and clean full-circle geometry:</Text>
          <CircularDialGauge
            variant="circle"
            value={temp}
            minValue={0}
            maxValue={60}
            title="Core Temp"
            unit="°C"
            size={210}
            color="#EC4899"
            backgroundColor="#FCE7F3"
            needleType="dot"
            showScale={false}
            containerStyle={styles.gaugeContainer}
          />
        </View>

        {/* 5. Dual Dashboard Gauges (Responsive Row) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Dual Sensor Dashboard</Text>
          <View style={styles.row}>
            <CircularDialGauge
              value={230}
              minValue={180}
              maxValue={260}
              title="Voltage"
              unit="V"
              color="#F97316"
              size={140}
              showScale={true}
              majorTickCount={5}
              minorTicksPerInterval={1}
            />
            <CircularDialGauge
              value={14.8}
              minValue={0}
              maxValue={30}
              title="Current"
              unit="A"
              color="#3B82F6"
              size={140}
              decimalPlaces={1}
              showScale={true}
              majorTickCount={4}
              minorTicksPerInterval={1}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subHeader: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    alignSelf: 'flex-start',
    marginBottom: 16,
    lineHeight: 18,
  },
  gaugeContainer: {
    marginVertical: 10,
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  highlightText: {
    color: '#818CF8',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 8,
  },
});

export default ExampleApp;