import { Button, Col, Modal, Row } from 'antd';
import React from 'react';

import { LABELS } from '../../../../constants';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import '../style.less';

import {
  Governance,
  Proposal,
  ProposalState,
  TokenOwnerRecord,
  VoteRecord,
} from '@solana/spl-governance';

import { YesNoVote } from '@solana/spl-governance';

import { castVote } from '../../../../actions/castVote';

import { useRpcContext } from '../../../../hooks/useRpcContext';
import { Option } from '../../../../tools/option';
import { ProgramAccount } from '@solana/spl-governance';
import { AccountVoterWeightRecord } from '../../../../hooks/governance-sdk';

const { confirm } = Modal;
export function CastVoteButton({
  proposal,
  governance,
  tokenOwnerRecord,
  voterWeightRecord,
  vote,
  voteRecord,
  hasVoteTimeExpired,
}: {
  proposal: ProgramAccount<Proposal>;
  governance: ProgramAccount<Governance>;
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>;
  voterWeightRecord?: AccountVoterWeightRecord;
  vote: YesNoVote;
  voteRecord: Option<ProgramAccount<VoteRecord>> | undefined;
  hasVoteTimeExpired: boolean | undefined;
}) {
  const rpcContext = useRpcContext();

  const canVote =
    !tokenOwnerRecord?.account.governingTokenDepositAmount.isZero()
    || (voterWeightRecord && voterWeightRecord.voterWeight.account.voterWeight.toNumber() > 0);

  const isVisible =
    hasVoteTimeExpired === false &&
    voteRecord?.isNone() &&
    canVote &&
    proposal.account.state === ProposalState.Voting;

  const [btnLabel, title, msg, icon] =
    vote === YesNoVote.Yes
      ? [
        LABELS.VOTE_YEAH,
        LABELS.VOTE_YEAH_QUESTION,
        LABELS.VOTE_YEAH_MSG,
        <CheckOutlined />,
      ]
      : [
        LABELS.VOTE_NAY,
        LABELS.VOTE_NAY_QUESTION,
        LABELS.VOTE_NAY_MSG,
        <CloseOutlined />,
      ];

  return isVisible ? (
    <Button
      type="primary"
      icon={icon}
      onClick={() =>
        confirm({
          title: title,
          icon: icon,
          content: (
            <Row>
              <Col span={24}>
                <p>{msg}</p>
              </Col>
            </Row>
          ),
          okText: LABELS.CONFIRM,
          cancelText: LABELS.CANCEL,
          onOk: async () => {
            castVote(
              rpcContext,
              governance.account.realm,
              proposal,
              tokenOwnerRecord.pubkey,
              vote,
              voterWeightRecord?.voterWeight.pubkey,
              voterWeightRecord?.maxVoterWeight.pubkey
            );
          },
        })
      }
    >
      {btnLabel}
    </Button>
  ) : null;
}
