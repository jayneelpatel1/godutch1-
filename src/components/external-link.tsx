/**
 * @component ExternalLink
 * @description Link component that opens URLs in an in-app browser on native
 *              (via expo-web-browser) and in a new tab on web.
 *
 * @props
 *   - href: string — The URL to open
 *   - All Link props from expo-router
 *
 * @platform Android ✅ | iOS ✅ | Web ✅
 */

import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          event.preventDefault();
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
