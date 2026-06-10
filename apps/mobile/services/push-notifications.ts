import Constants from 'expo-constants';

import * as Device from 'expo-device';

import * as Notifications from 'expo-notifications';

import { Platform } from 'react-native';



import { getSupabaseClient } from '@/services/supabase';
import { logger } from '@/utils/logger';



const pushSupported = Platform.OS === 'ios' || Platform.OS === 'android';



function isExpoGo(): boolean {

  return Constants.appOwnership === 'expo';

}



/** Push is unavailable in Expo Go on Android (SDK 53+) and on simulators/web. */

export function isPushNotificationsAvailable(): boolean {

  if (!pushSupported || !Device.isDevice) return false;

  if (isExpoGo() && Platform.OS === 'android') return false;

  return true;

}



if (isPushNotificationsAvailable()) {

  Notifications.setNotificationHandler({

    handleNotification: async () => ({

      shouldShowAlert: true,

      shouldPlaySound: true,

      shouldSetBadge: false,

      shouldShowBanner: true,

      shouldShowList: true,

    }),

  });

}



function getExpoProjectId(): string | undefined {

  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;

  return (

    extra?.eas?.projectId ??

    Constants.easConfig?.projectId ??

    Constants.expoConfig?.extra?.expoProjectId

  );

}



export async function registerAdminPushToken(userId: string): Promise<void> {

  if (!isPushNotificationsAvailable()) return;



  const client = getSupabaseClient();

  if (!client) return;



  try {

    const { status: existing } = await Notifications.getPermissionsAsync();

    let finalStatus = existing;

    if (existing !== 'granted') {

      const { status } = await Notifications.requestPermissionsAsync();

      finalStatus = status;

    }

    if (finalStatus !== 'granted') return;



    if (Platform.OS === 'android') {

      await Notifications.setNotificationChannelAsync('default', {

        name: 'BarberGo',

        importance: Notifications.AndroidImportance.DEFAULT,

      });

    }



    const projectId = getExpoProjectId();

    const tokenResponse = projectId

      ? await Notifications.getExpoPushTokenAsync({ projectId })

      : await Notifications.getExpoPushTokenAsync();



    const expoPushToken = tokenResponse.data;

    const deviceName = Device.modelName ?? Platform.OS;



    const { error } = await client.from('admin_push_tokens').upsert(

      {

        user_id: userId,

        expo_push_token: expoPushToken,

        device_name: deviceName,

        updated_at: new Date().toISOString(),

      },

      { onConflict: 'user_id,expo_push_token' }

    );



    if (error) {

      logger.warn('push', 'registerAdminPushToken failed', error);

    }

  } catch (err) {

    logger.warn('push', 'registerAdminPushToken skipped', err);

  }

}



export async function notifyNewBarberRegistration(input: {

  barberId: string;

  displayName?: string;

  phone?: string;

  email?: string;

}): Promise<void> {

  const client = getSupabaseClient();

  if (!client) return;



  try {

    const { error } = await client.functions.invoke('notify-new-barber', {

      body: input,

    });

    if (error) {

      logger.warn('push', 'notify-new-barber failed', error);

    }

  } catch (err) {

    logger.warn('push', 'notify-new-barber invoke failed', err);

  }

}



export type NotificationRouteData = {

  path?: string;

  barberId?: string;

};



export function getNotificationRouteData(

  response: Notifications.NotificationResponse | null

): NotificationRouteData | null {

  if (!response) return null;

  const data = response.notification.request.content.data as NotificationRouteData;

  return data?.path ? data : null;

}

