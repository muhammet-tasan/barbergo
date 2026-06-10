import { ActivityIndicator, Platform, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as Linking from 'expo-linking';

import { useRouter } from 'expo-router';

import { useEffect, useState } from 'react';



import { AppButton } from '@/components/AppButton';

import { colors } from '@/constants/theme';

import { completeAuthSessionFromCallbackUrl } from '@/services/auth-redirect';

import { getSupabaseClient } from '@/services/supabase';



type CallbackState = 'loading' | 'success' | 'error';



function getWebCallbackUrl(): string | null {

  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;

  return window.location.href;

}



export default function AuthCallbackScreen() {

  const router = useRouter();

  const deepLinkUrl = Linking.useURL();

  const [state, setState] = useState<CallbackState>('loading');

  const [detail, setDetail] = useState<string | undefined>();



  useEffect(() => {

    let cancelled = false;

    let unsubscribe: (() => void) | undefined;



    async function finish(incomingUrl: string | null) {

      const client = getSupabaseClient();

      if (!client) {

        if (!cancelled) {

          setState('error');

          setDetail('Supabase ist nicht konfiguriert.');

        }

        return;

      }



      const { data: authListener } = client.auth.onAuthStateChange((event, session) => {

        if (cancelled) return;

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {

          setState('success');

        }

      });

      unsubscribe = () => authListener.subscription.unsubscribe();



      const callbackUrl = incomingUrl ?? getWebCallbackUrl();

      if (callbackUrl) {

        const parsed = await completeAuthSessionFromCallbackUrl(client, callbackUrl);

        if (parsed.error && !cancelled) {

          setState('error');

          setDetail(parsed.error);

          return;

        }

      }



      const { data, error } = await client.auth.getSession();

      if (error) {

        if (!cancelled) {

          setState('error');

          setDetail(error.message);

        }

        return;

      }



      if (data.session) {

        if (!cancelled) setState('success');

        return;

      }



      if (Platform.OS === 'web') {

        await new Promise((resolve) => setTimeout(resolve, 1200));

        const retry = await client.auth.getSession();

        if (retry.data.session) {

          if (!cancelled) setState('success');

          return;

        }

      }



      await new Promise((resolve) => setTimeout(resolve, 2000));

      const final = await client.auth.getSession();

      if (!cancelled) {

        if (final.data.session) {

          setState('success');

        } else {

          setState('error');

          setDetail(

            'Bestätigung konnte nicht abgeschlossen werden. Bitte erneut anmelden oder Link nochmals öffnen.',

          );

        }

      }

    }



    async function resolveInitialUrl(): Promise<string | null> {

      if (deepLinkUrl) return deepLinkUrl;

      if (Platform.OS === 'web') return getWebCallbackUrl();

      return Linking.getInitialURL();

    }



    void resolveInitialUrl().then((url) => finish(url));



    return () => {

      cancelled = true;

      unsubscribe?.();

    };

  }, [deepLinkUrl]);



  return (

    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>

      <View className="flex-1 px-6 justify-center items-center">

        {state === 'loading' ? (

          <>

            <ActivityIndicator color={colors.accent} size="large" />

            <Text className="text-brand-muted text-center mt-6 leading-5">

              E-Mail wird bestätigt …

            </Text>

          </>

        ) : null}



        {state === 'success' ? (

          <>

            <Text className="text-brand-text text-xl font-bold text-center mb-3">

              E-Mail bestätigt

            </Text>

            <Text className="text-brand-muted text-center leading-5 mb-8">

              Dein Barber-Konto ist aktiv. Du kannst dich jetzt in der BarberGo-App anmelden.

            </Text>

            <AppButton label="Zur Anmeldung" onPress={() => router.replace('/login')} />

          </>

        ) : null}



        {state === 'error' ? (

          <>

            <Text className="text-error text-xl font-bold text-center mb-3">

              Bestätigung fehlgeschlagen

            </Text>

            {detail ? (

              <Text className="text-brand-muted text-center leading-5 mb-8">{detail}</Text>

            ) : null}

            <AppButton label="Zur Anmeldung" onPress={() => router.replace('/login')} />

          </>

        ) : null}

      </View>

    </SafeAreaView>

  );

}

