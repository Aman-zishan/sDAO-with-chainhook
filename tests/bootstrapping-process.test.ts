import { Cl, cvToJSON } from '@stacks/transactions';
import { describe, expect, it } from 'vitest';

const accounts = simnet.getAccounts();
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const deployer = accounts.get('deployer')!;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const address1 = accounts.get('wallet_1')!;

describe('sDAO bootstrap flow test', () => {
  it('transfer initial grant fund of 1 million STX', () => {
    simnet.transferSTX(
      1000000000000n,
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.core',
      deployer
    );
  });

  it('Should be able to call construct function in core contract', () => {
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
  });

  it('Should be able to propose milestone extension', () => {
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
  });

  it('Should be able to vote on milestone extension', () => {
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
  });

  it('Should be able to conclude milestone extension proposal', () => {
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
});
