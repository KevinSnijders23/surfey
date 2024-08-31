import {
  AppstoreOutlined,
  DatabaseOutlined,
  HomeOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { lazy } from 'react';
import type { RouteList } from '@/router/route';
import { FormattedMessage } from '@/locales';
import Layout from '@/layout';
import Authority from '@/layout/Authority';

const Home = lazy(() => import('@/views/Home'));
const DetailsPage = lazy(() => import('@/views/DetailsPage'));

export const defaultRoute: RouteList[] = [
  {
    path: '/home',
    id: 'Home',
    element: <Home />,
    handle: { label: FormattedMessage({ id: 'layout.memu.home' }), icon: <HomeOutlined /> },
  },
  // {
  //   path: '/details-page',
  //   id: 'DetailsPage',
  //   element: <DetailsPage />,
  //   handle: { label: FormattedMessage({ id: 'layout.memu.detailsPage' }), whiteList: true, icon: <DatabaseOutlined /> },
  // },
];

const ErrorPage403 = lazy(() => import('@/views/core/error/403'));
const ErrorElement = lazy(() => import('@/views/core/error/ErrorElement'));
const Refresh = lazy(() => import('@/views/core/Refresh'));

const Login = lazy(() => import('@/views/Login'));

export const whiteList: RouteList[] = [
  {
    path: '*',
    element: <ErrorPage403 />,
  },
  {
    path: '/refresh/*',
    element: <Refresh />,
    handle: { label: '', hideSidebar: true, whiteList: true },
  },
];

export const baseRouter: RouteList[] = [
  {
    path: '/',
    element: (
      <Authority>
        <Layout />
      </Authority>
    ),
    errorElement: <ErrorElement pageType="Layout" />,
    children: [...whiteList],
  },
  {
    path: '/login',
    element: <Login />,
  },
];
