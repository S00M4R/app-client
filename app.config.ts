import 'dotenv/config';

export default {
  expo: {
    name: 'Nearby',
    slug: 'community-issue-reporter',
    scheme: 'nearby',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#121D2E'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourorg.nearby',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Nearby uses your location to show issues around you and to accurately place pins you drop.',
        NSCameraUsageDescription:
          'Nearby uses your camera to attach a photo to a report.',
        NSPhotoLibraryUsageDescription:
          'Nearby uses your photo library so you can attach an existing photo to a report.'
      }
    },
    android: {
      package: 'com.yourorg.nearby',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#121D2E'
      },
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE'
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY
        }
      }
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Nearby uses your location to show issues around you and to accurately place pins you drop.'
        }
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Nearby uses your photo library so you can attach a photo to a report.',
          cameraPermission: 'Nearby uses your camera so you can attach a photo to a report.'
        }
      ]
    ],
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: '5f9cd496-089f-43e8-b64f-a9125cdb4a01'
      }
    }
  }
};
