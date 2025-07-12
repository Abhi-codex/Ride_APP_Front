import React from 'react';
import { Platform, Text, View } from 'react-native';
import { colors, styles as tailwindStyles } from '../constants/TailwindStyles';

let MapView: any;
let Marker: any;
let Polyline: any;
let PROVIDER_GOOGLE: any;

// Only import react-native-maps on native platforms
if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
    Polyline = RNMaps.Polyline;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
  } catch (error) {
    console.log('react-native-maps not available:', error);
  }
}

interface MapViewWrapperProps {
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
  children?: React.ReactNode;
  onPress?: () => void;
}

interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  pinColor?: string;
  onPress?: () => void;
  onCalloutPress?: () => void;
}

interface PolylineProps {
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  strokeColor?: string;
  strokeWidth?: number;
}

const WebMapFallback: React.FC<MapViewWrapperProps> = ({ style, region, children, onPress }) => (
  <View 
    style={[
      style, 
      tailwindStyles.bgGray100,
      tailwindStyles.justifyCenter,
      tailwindStyles.alignCenter,
      tailwindStyles.border2,
      tailwindStyles.borderGray300,
      tailwindStyles.roundedLg,
      tailwindStyles.p4
    ]}
    onTouchEnd={onPress}
  >
    <Text style={[
      tailwindStyles.textBase,
      tailwindStyles.textGray600,
      tailwindStyles.textCenter,
      tailwindStyles.fontMedium
    ]}>
      🗺️ Map View (Web Preview)
    </Text>
    {region && (
      <Text style={[tailwindStyles.textSm, tailwindStyles.textGray500, tailwindStyles.textCenter]}>
        Location: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
      </Text>
    )}
    {children}
  </View>
);

const WebMarkerFallback: React.FC<MarkerProps> = ({ coordinate, title, pinColor, onPress, onCalloutPress }) => (
  <View 
    style={[
      tailwindStyles.absolute,
      tailwindStyles.p2,
      tailwindStyles.roundedLg,
      tailwindStyles.m1,
      { backgroundColor: pinColor || colors.danger[500], maxWidth: 200 }
    ]}
    onTouchEnd={onPress}
  >
    <Text 
      style={[
        tailwindStyles.textWhite,
        tailwindStyles.textXs,
        tailwindStyles.fontBold,
        tailwindStyles.textCenter
      ]}
      onPress={onCalloutPress}
    >
      📍 {title || 'Marker'}
    </Text>
    <Text style={[
      tailwindStyles.textWhite,
      tailwindStyles.textXs,
      tailwindStyles.textCenter
    ]}>
      ({coordinate.latitude.toFixed(4)}, {coordinate.longitude.toFixed(4)})
    </Text>
  </View>
);

const WebPolylineFallback: React.FC<PolylineProps> = ({ coordinates, strokeColor }) => (
  <View style={[
    tailwindStyles.absolute,
    tailwindStyles.bottom10,
    tailwindStyles.left25,
    tailwindStyles.right25,
    tailwindStyles.p2,
    tailwindStyles.bgWhite,
    tailwindStyles.border2,
    tailwindStyles.roundedLg,
    tailwindStyles.shadowMd,
    { borderColor: strokeColor || colors.primary[500], opacity: 0.9 }
  ]}>
    <Text style={[
      tailwindStyles.textXs,
      tailwindStyles.textGray700,
      tailwindStyles.textCenter,
      tailwindStyles.fontMedium
    ]}>
      🛣️ Route ({coordinates.length} points)
    </Text>
  </View>
);

export const MapViewWrapper: React.FC<MapViewWrapperProps> = (props) => {
  console.log('MapViewWrapper - Platform.OS:', Platform.OS);
  
  if (Platform.OS === 'web' || !MapView) {
    console.log('MapViewWrapper - Using fallback');
    return <WebMapFallback {...props} />;
  }
  
  console.log('MapViewWrapper - Using native MapView');
  // For mobile platforms (iOS/Android), use the actual MapView
  return (
    <MapView
      style={props.style}
      region={props.region}
      showsUserLocation={props.showsUserLocation}
      showsMyLocationButton={true}
      followsUserLocation={false}
      zoomEnabled={true}
      scrollEnabled={true}
      rotateEnabled={true}
      pitchEnabled={true}
      mapType="standard"
      provider={PROVIDER_GOOGLE}
      loadingEnabled={true}
      loadingIndicatorColor={colors.primary[600]}
      loadingBackgroundColor={colors.gray[100]}
      onPress={props.onPress}
    >
      {props.children}
    </MapView>
  );
};

export const MarkerWrapper: React.FC<MarkerProps> = (props) => {
  if (Platform.OS === 'web' || !Marker) {
    return <WebMarkerFallback {...props} />;
  }
  
  return (
    <Marker
      coordinate={props.coordinate}
      title={props.title}
      pinColor={props.pinColor || colors.primary[600]}
      onPress={props.onPress}
      onCalloutPress={props.onCalloutPress}
    />
  );
};

export const PolylineWrapper: React.FC<PolylineProps> = (props) => {
  if (Platform.OS === 'web' || !Polyline) {
    return <WebPolylineFallback {...props} />;
  }
  
  return (
    <Polyline
      coordinates={props.coordinates}
      strokeColor={props.strokeColor || colors.primary[600]}
      strokeWidth={props.strokeWidth || 4}
      lineCap="round"
      lineJoin="round"
    />
  );
};
