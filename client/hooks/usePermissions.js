import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

export default function usePermissions() {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      setHasPermission(
        cameraStatus === 'granted' &&
        mediaStatus === 'granted' &&
        audioStatus === 'granted'
      );
    })();
  }, []);

  return hasPermission;
}
