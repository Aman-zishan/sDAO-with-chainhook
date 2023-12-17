import { describe, expect, it } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const address1 = accounts.get('wallet_1')!;

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe('core tests', () => {
  it('transfer initial grant fund of 1 million STX', () => {
    simnet.transferSTX(
      1000000000000n,
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.core',
      deployer
    );
  });

  it('should contruct boostrap contract', () => {
    simnet.callPublicFn(
      'core',
      'construct',
      [Cl.contractPrincipal(deployer, 'bootstrap')],
      deployer
    );
  });

  it('should propose milestone extension', () => {
    const proposeMilestoneExtension = simnet.callPublicFn(
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

    console.log(proposeMilestoneExtension.result);

    const result = simnet.callPublicFn(
      'proposal-voting',
      'vote',
      [
        Cl.uint(100),
        Cl.bool(true),
        Cl.contractPrincipal(deployer, 'milestone-extension-proposal')
      ],
      address1
    );

    console.log(result.result);
  });
});
