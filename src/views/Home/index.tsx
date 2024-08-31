import { memo } from 'react';
import { Card, Col, Progress, Row, theme } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import './index.less';
import { getNumericalValue } from './style';
import CheckWIF from './components/CheckWIF';
import GenerateWIF from './components/GenerateWIF';

const Home = memo(() => {
  const thme = theme.useToken();

  const speedList = [
    {
      title: '待办事项',
      online: 24,
      total: 70,
    },
    {
      title: '待办任务',
      online: 39,
      total: 100,
    },
    {
      title: '目标计划',
      online: 5,
      total: 10,
    },
    {
      title: '评论回复',
      online: 10,
      total: 40,
    },
  ];

  const value = (online: number, total: number) => {
    return Math.round((online / total) * 100);
  };

  return (
    <>
            <div className="">
      <Row gutter={[12, 12]}>
        <Col lg={24} sm={24} xs={24}>
          <Card size="small">
            <GenerateWIF />
          </Card>
        </Col>
      </Row>
    </div>
    <br />
        <div className="">
      <Row gutter={[12, 12]}>
        <Col lg={24} sm={24} xs={24}>
          <Card size="small">
            <CheckWIF />
          </Card>
        </Col>
      </Row>
    </div>
    </>

    
  );
});

export default Home;
