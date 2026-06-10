import { type Href, useRouter } from 'expo-router';

import * as Notifications from 'expo-notifications';

import { useEffect, useRef } from 'react';



import {

  getNotificationRouteData,

  isPushNotificationsAvailable,

} from '@/services/push-notifications';



export function usePushNotificationRouting(): void {

  const router = useRouter();

  const handledInitial = useRef(false);



  useEffect(() => {

    if (!isPushNotificationsAvailable()) return;



    const navigate = (response: Notifications.NotificationResponse | null) => {

      const data = getNotificationRouteData(response);

      if (!data?.path) return;

      router.push(data.path as Href);

    };



    if (!handledInitial.current) {

      handledInitial.current = true;

      void Notifications.getLastNotificationResponseAsync()

        .then(navigate)

        .catch(() => undefined);

    }



    const subscription = Notifications.addNotificationResponseReceivedListener(navigate);

    return () => subscription.remove();

  }, [router]);

}

