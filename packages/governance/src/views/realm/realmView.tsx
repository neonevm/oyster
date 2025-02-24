import { Col, List, Popover, Row, Space, Typography } from 'antd';
import React, { useMemo } from 'react';
import { ExplorerLink, useConnectionConfig } from '@oyster/common';
import { useHistory } from 'react-router-dom';
import { useRealm } from '../../contexts/GovernanceContext';
import { useGovernancesByRealm, useWalletTokenOwnerRecord } from '../../hooks/apiHooks';
import { Background } from '../../components/Background';
import { useKeyParam } from '../../hooks/useKeyParam';
import { RealmBadge } from '../../components/RealmBadge/realmBadge';
import { GovernanceBadge } from '../../components/GovernanceBadge/governanceBadge';
import { RealmDepositBadge } from '../../components/RealmDepositBadge/realmDepositBadge';
import { useRpcContext } from '../../hooks/useRpcContext';
import { getGovernanceUrl } from '../../tools/routeTools';
import { RealmPopUpDetails } from './components/realmPopUpDetails';
import { RealmActionBar } from './buttons/realmActionBar';
import { getGovernanceMeta } from '../../hooks/useGovernanceMeta';
import { useArrayLengthWatcher } from '../../hooks/useArrayLengthWatcher';
import { DepositsProvider } from '../../components/RealmDepositBadge/realmDepositProvider';
import './style.less';

const { Text } = Typography;

export const RealmView = () => {
  const history = useHistory();
  let realmKey = useKeyParam();
  const { programIdBase58 } = useRpcContext();
  const { env } = useConnectionConfig();

  const realm = useRealm(realmKey);
  const governances = useGovernancesByRealm(realmKey);
  const isGovernancesLoading = useArrayLengthWatcher(governances);

  const communityTokenOwnerRecord = useWalletTokenOwnerRecord(
    realm?.pubkey,
    realm?.account.communityMint
  );

  const councilTokenOwnerRecord = useWalletTokenOwnerRecord(
    realm?.pubkey,
    realm?.account.config.councilMint
  );

  const governanceItems = useMemo(() => {
    return governances.sort((g1, g2) => g1.account.governedAccount
      .toBase58().localeCompare(g2.account.governedAccount.toBase58()))
      .map(g => ({
        key: g.pubkey.toBase58(),
        href: getGovernanceUrl(g.pubkey, programIdBase58),
        title: getGovernanceMeta(env, g.pubkey, programIdBase58)?.name,
        badge: <GovernanceBadge governance={g} realm={realm}></GovernanceBadge>
      }));
  }, [env, governances, programIdBase58, realm]);

  return (
    <DepositsProvider realm={realm}>
      <Background />
      <Row>
        <Col flex='auto' xxl={15} xs={24} className='realm-container'>
          <Row>
            <Col md={12} xs={24} className='realm-title'>
              <Row>
                <Col>
                  {realm && <Popover content={<RealmPopUpDetails realm={realm}></RealmPopUpDetails>}
                                     title={realm.account.name}
                                     trigger='click'
                                     placement='topLeft'>
                    <span>
                      <RealmBadge
                        size={60}
                        communityMint={realm.account.communityMint}
                        councilMint={realm.account.config.councilMint}
                      ></RealmBadge>
                    </span>
                  </Popover>}
                </Col>
                <Col style={{ textAlign: 'left', marginLeft: 8 }}>
                  {realm && <Space direction='vertical' size={0}>
                    <Space align='baseline'>
                      <h1>{realm?.account.name}</h1>{' '}
                      <h3><ExplorerLink short address={realm.account.communityMint} type='address' /></h3>
                    </Space>
                    <Text type='secondary'>
                      <RealmDepositBadge
                        realm={realm}
                        communityTokenOwnerRecord={communityTokenOwnerRecord}
                        councilTokenOwnerRecord={councilTokenOwnerRecord}
                        showVoteWeights
                      ></RealmDepositBadge>
                    </Text>
                  </Space>
                  }
                </Col>
              </Row>
            </Col>
            <Col
              md={12}
              xs={24}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end'
              }}
            >
              <RealmActionBar realm={realm} showSettings={false}></RealmActionBar>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col flex='auto' xxl={15} xs={24} className='realm-container'>
          <h1 className='governances-list-title'>Governances</h1>
          <List
            loading={isGovernancesLoading}
            itemLayout='vertical'
            size='large'
            pagination={false}
            dataSource={governanceItems}
            renderItem={item => (
              <List.Item key={item.key} className='realm-item' onClick={() => history.push(item.href)}>
                <List.Item.Meta
                  title={item.title}
                  avatar={item.badge}
                ></List.Item.Meta>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </DepositsProvider>
  );
};
