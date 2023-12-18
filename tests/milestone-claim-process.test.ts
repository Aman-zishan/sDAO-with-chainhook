import { Cl, cvToJSON } from '@stacks/transactions';
import { beforeEach, describe, expect, it } from 'vitest';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const address1 = accounts.get('wallet_1')!;

describe('sDAO milestone claim process', () => {
  beforeEach(() => {
    simnet.transferSTX(
      1000000000000n,
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.core',
      deployer
    );

    const construct = simnet.callPublicFn(
      'core',
      'construct',
      [Cl.contractPrincipal(deployer, 'bootstrap')],
      deployer
    );

    expect(construct.result).toBeOk(Cl.bool(true));

    const proposalMilestoneExtension = simnet.callPublicFn(
      'proposal-submission',
      'propose',
      [
        Cl.contractPrincipal(deployer, 'milestone-extension-proposal'),
        Cl.stringAscii('proposal for milestone'),
        Cl.stringUtf8(
          'this proposal once passed will enable milestone extension'
        )
      ],
      deployer
    );

    expect(proposalMilestoneExtension.result).toBeOk(Cl.bool(true));

    const proposalMilestoneExtensionVoted = simnet.callPublicFn(
      'proposal-voting',
      'vote',
      [
        Cl.uint(100),
        Cl.bool(true),
        Cl.contractPrincipal(deployer, 'milestone-extension-proposal')
      ],
      address1
    );

    expect(proposalMilestoneExtensionVoted.result).toBeOk(Cl.bool(true));

    const getProposalData = simnet.callReadOnlyFn(
      'proposal-voting',
      'get-proposal-data',
      [Cl.contractPrincipal(deployer, 'milestone-extension-proposal')],
      address1
    );

    expect(
      cvToJSON(getProposalData.result).value.value['votes-for'].value
    ).toBe('100');

    const proposalMilestoneExtensionConcluded = simnet.callPublicFn(
      'proposal-voting',
      'conclude',
      [Cl.contractPrincipal(deployer, 'milestone-extension-proposal')],
      address1
    );

    expect(proposalMilestoneExtensionConcluded.result).toBeOk(Cl.bool(true));
  });

  it('propose, vote and conclude new grant', () => {
    const proposalNewGrant = simnet.callPublicFn(
      'proposal-submission',
      'propose',
      [
        Cl.contractPrincipal(deployer, 'grant-proposal'),
        Cl.stringAscii('proposal for friend.tech'),
        Cl.stringUtf8(
          'this proposal once passed will allocate fund to friend.tech'
        )
      ],
      deployer
    );

    expect(proposalNewGrant.result).toBeOk(Cl.bool(true));

    const proposalNewGrantVoted = simnet.callPublicFn(
      'proposal-voting',
      'vote',
      [
        Cl.uint(100),
        Cl.bool(true),
        Cl.contractPrincipal(deployer, 'grant-proposal')
      ],
      address1
    );

    expect(proposalNewGrantVoted.result).toBeOk(Cl.bool(true));

    const getProposalData = simnet.callReadOnlyFn(
      'proposal-voting',
      'get-proposal-data',
      [Cl.contractPrincipal(deployer, 'grant-proposal')],
      address1
    );

    expect(
      cvToJSON(getProposalData.result).value.value['votes-for'].value
    ).toBe('100');

    const proposalNewGrantConcluded = simnet.callPublicFn(
      'proposal-voting',
      'conclude',
      [Cl.contractPrincipal(deployer, 'grant-proposal')],
      address1
    );

    expect(proposalNewGrantConcluded.result).toBeOk(Cl.bool(true));
  });

  it('propose, vote and conclude new grant milestone claim', () => {
    const proposalNewGrant = simnet.callPublicFn(
      'proposal-submission',
      'propose',
      [
        Cl.contractPrincipal(deployer, 'grant-proposal'),
        Cl.stringAscii('proposal for grant claim'),
        Cl.stringUtf8(
          'this proposal once passed will claim funds to ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5'
        )
      ],
      deployer
    );

    expect(proposalNewGrant.result).toBeOk(Cl.bool(true));

    const proposalNewGrantVoted = simnet.callPublicFn(
      'proposal-voting',
      'vote',
      [
        Cl.uint(100),
        Cl.bool(true),
        Cl.contractPrincipal(deployer, 'grant-proposal')
      ],
      address1
    );

    expect(proposalNewGrantVoted.result).toBeOk(Cl.bool(true));

    const getGrantProposalData = simnet.callReadOnlyFn(
      'proposal-voting',
      'get-proposal-data',
      [Cl.contractPrincipal(deployer, 'grant-proposal')],
      address1
    );

    expect(
      cvToJSON(getGrantProposalData.result).value.value['votes-for'].value
    ).toBe('100');

    const proposalNewGrantConcluded = simnet.callPublicFn(
      'proposal-voting',
      'conclude',
      [Cl.contractPrincipal(deployer, 'grant-proposal')],
      address1
    );

    expect(proposalNewGrantConcluded.result).toBeOk(Cl.bool(true));

    const proposalNewGrantClaim = simnet.callPublicFn(
      'proposal-submission',
      'propose',
      [
        Cl.contractPrincipal(deployer, 'grant-milestone-claim-proposal'),
        Cl.stringAscii('proposal for friend.tech'),
        Cl.stringUtf8(
          'this proposal once passed will allocate fund to friend.tech'
        )
      ],
      deployer
    );

    expect(proposalNewGrantClaim.result).toBeOk(Cl.bool(true));

    const proposalNewGrantClaimVoted = simnet.callPublicFn(
      'proposal-voting',
      'vote',
      [
        Cl.uint(100),
        Cl.bool(true),
        Cl.contractPrincipal(deployer, 'grant-milestone-claim-proposal')
      ],
      address1
    );

    expect(proposalNewGrantClaimVoted.result).toBeOk(Cl.bool(true));

    const getProposalData = simnet.callReadOnlyFn(
      'proposal-voting',
      'get-proposal-data',
      [Cl.contractPrincipal(deployer, 'grant-milestone-claim-proposal')],
      address1
    );

    expect(
      cvToJSON(getProposalData.result).value.value['votes-for'].value
    ).toBe('100');

    simnet.mineEmptyBlocks(2000);

    const proposalNewGrantClaimConcluded = simnet.callPublicFn(
      'proposal-voting',
      'conclude',
      [Cl.contractPrincipal(deployer, 'grant-milestone-claim-proposal')],
      deployer
    );

    expect(proposalNewGrantClaimConcluded.result).toBeOk(Cl.bool(true));
  });
});
