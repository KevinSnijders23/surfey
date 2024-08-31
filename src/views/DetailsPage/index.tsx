import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/locales';

const DateilsPage = () => {
  const navigate = useNavigate();
  const intl = useLocale();

  return (
    <div>
      Other page
    </div>
  );
};

export default DateilsPage;
