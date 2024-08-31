import { ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import enUS from 'antd/locale/en_US';
import 'antd/dist/reset.css';
import { IntlProvider } from 'react-intl';
import { Suspense, useEffect, useMemo } from 'react';

import { shallowEqual } from 'react-redux';
import { localeConfig, setIntl } from './locales';
import { useAppSelector } from './store/hooks';
import { initAsyncRoute } from './router/utils';
import LayoutSpin from './components/LayoutSpin';
import RouteView from './router';

function App() {
  const { locale, color, themeMode } = useAppSelector(
    (state) => ({
      locale: state.app.locale,
      color: state.app.color,
      themeMode: state.app.themeMode,
    }),
    shallowEqual,
  );
  const { userInfo } = useAppSelector((state) => state.user);
  const asyncRouter = useAppSelector((state) => state.route.asyncRouter);

  const getLocale = useMemo(() => {
    setIntl(locale);
    dayjs.locale('en');
      return enUS;
  }, [locale]);

  useEffect(() => {
    if (!asyncRouter.length && userInfo) {
      initAsyncRoute(userInfo.power);
    }
  }, []);

  const loading = useMemo(() => {
    if (!asyncRouter.length && userInfo) {
      return true;
    }
    return false;
  }, [asyncRouter]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: color || '#409eff',
        },
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
      locale={getLocale}
    >
      <IntlProvider locale={locale} messages={localeConfig[locale]}>
        {loading ? (
          <LayoutSpin position="fixed" />
        ) : (
          <Suspense fallback={<LayoutSpin />}>
            <RouteView />
          </Suspense>
    
        )}
      </IntlProvider>
    </ConfigProvider>
  );
}

export default App;
