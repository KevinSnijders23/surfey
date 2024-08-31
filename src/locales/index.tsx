import type { IntlShape, MessageDescriptor } from 'react-intl';
import { createIntl, useIntl, FormattedMessage as IntFormattedMessage } from 'react-intl';
import en_US from './en_US';

export const localeConfig = {
  'en-US': en_US,
};

export type LocaleType = keyof typeof localeConfig;

export type LocaleId = keyof typeof en_US;

interface Props extends MessageDescriptor {
  id: LocaleId;
}

export const FormattedMessage: React.FC<Props> = (props) => {
  return <IntFormattedMessage {...props} id={props.id} />;
};

type FormatMessageProps = (descriptor: Props) => string;

export const useLocale = () => {
  const { formatMessage: intlFormatMessage, ...rest } = useIntl();
  const formatMessage: FormatMessageProps = intlFormatMessage;

  return {
    ...rest,
    formatMessage,
  };
};

let g_intl: IntlShape;

/**
 * @param locale
 * @param changeIntl g_intl
 * @returns IntlShape
 */
export const getIntl = (locale?: LocaleType, changeIntl?: boolean) => {
  if (g_intl && !changeIntl && !locale) {
    return g_intl;
  }

  if (locale && localeConfig[locale]) {
    return createIntl({
      locale,
      messages: localeConfig[locale],
    });
  }

  // 如果还没有，返回一个空的
  return createIntl({
    locale: 'en-US',
    messages: {},
  });
};

export const getIntlText = (id: LocaleId) => {
  return getIntl().formatMessage({ id });
};

/**
 * 切换全局的 intl 的设置
 * @param locale 语言的key
 */
export const setIntl = (locale: LocaleType) => {
  g_intl = getIntl(locale, true);
};
