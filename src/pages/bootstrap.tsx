import {
  useOpenContractCall,
  useOpenStxTokenTransfer
} from '@micro-stacks/react';
import {
  contractPrincipalCV,
  stringAsciiCV,
  stringUtf8CV
} from '@stacks/transactions';
import React, { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { toast } from 'sonner';
import LeftMenu from '../components/leftMenu';

const Bootstrap = () => {
  const [step, setStep] = React.useState(0);
  const { openStxTokenTransfer } = useOpenStxTokenTransfer();
  const { openContractCall } = useOpenContractCall();

  const { lastMessage } = useWebSocket('ws://localhost:3000');

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      console.log('Message from Server:', data.message);
      if (data.type === 'success') {
        toast.success(data.message);
      } else if (data.type === 'error') {
        toast.error(data.message);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    fetchDataFromSupabase();
  }, []);

  async function fetchDataFromSupabase() {
    // Replace this with your actual Supabase fetch logic
    // This is a placeholder for fetching data

    try {
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      };

      const response = await fetch(
        'http://localhost:3000/api/current-step',
        options
      );

      const data = await response.json();

      if (data.length > 0) {
        setStep(data[0].current_step);
      }
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  const handleTokenTransfer = async () => {
    if (step === 1 || step === 2 || step === 3) {
      toast.error('Already transferred');
      return;
    }
    await openStxTokenTransfer({
      recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.core',
      amount: 1000000000000n, //1M STX
      memo: 'grant funds',

      onFinish: async (data: any) => {
        console.log('finished token transfer!', data);
        await fetchDataFromSupabase();
      }
    });
  };
  const constructBootstrap = async () => {
    if (step === 2 || step === 3) {
      toast.error('Already constructed');
      return;
    }
    const functionArgs = [
      contractPrincipalCV(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        'bootstrap'
      )
    ];
    await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'core',
      functionName: 'construct',

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      functionArgs,

      onFinish: async (data: any) => {
        console.log('finished contract call!', data);
        await fetchDataFromSupabase();
      },
      onCancel: () => {
        console.log('popup closed!');
      }
    });
  };

  const proposeMilestoneExtension = async () => {
    if (step === 3) {
      toast.error('Already proposed');
      return;
    }
    const functionArgs = [
      contractPrincipalCV(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        'milestone-extension-proposal'
      ),
      stringAsciiCV('milestone-extension proposal'),
      stringUtf8CV('proposal to enable milestone extension')
    ];
    await openContractCall({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'proposal-submission',
      functionName: 'propose',

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      functionArgs,

      onFinish: async (data: any) => {
        console.log('finished contract call!', data);
        await fetchDataFromSupabase();
      },
      onCancel: () => {
        console.log('popup closed!');
      }
    });
  };

  return (
    <div className=" bg-blue-50 w-screen h-screen">
      <LeftMenu />

      <main className="ml-60 pt-10 ">
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 mb-5">
              <h1 className="text-3xl font-bold mb-5">Setup sDAO</h1>
              <div className="mb-[45px] gap-2">
                <p className="text-md mb-5">
                  Bootstrap the DAO by enabling extensions and proposing
                  milestone proposal.
                </p>
                <div className="flex flex-row text-md mb-5">
                  After completing theses steps go to
                  <span className="ml-1 mr-1 flex flex-row gap-1 font-bold">
                    <img src="/assets/proposals.png" alt="" width={20} />
                    <div>Proposals</div>
                  </span>
                  /{' '}
                  <span className="ml-1 text-blue-500 font-bold mr-2">
                    all proposals
                  </span>{' '}
                  vote and conclude.
                </div>
              </div>

              <ol className="ml-5 relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400">
                <li onClick={handleTokenTransfer} className="mb-10 ms-6">
                  {step === 1 || step === 2 || step === 3 ? (
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                      <svg
                        className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 12"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5.917 5.724 10.5 15 1.5"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                      <svg
                        className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                      </svg>
                    </span>
                  )}

                  <h3 className="font-medium leading-tight">
                    Transfer 1M STX grant fund
                  </h3>
                  <p className="text-sm">stx transfer</p>
                </li>
                <li
                  onClick={async () => {
                    await constructBootstrap();
                  }}
                  className="mb-10 ms-6"
                >
                  {step === 2 || step === 3 ? (
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                      <svg
                        className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 12"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5.917 5.724 10.5 15 1.5"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                      <svg
                        className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                      </svg>
                    </span>
                  )}
                  <h3 className="font-medium leading-tight">
                    Construct Bootstrap
                  </h3>
                  <p className="text-sm">enable extensions</p>
                </li>
                <li
                  onClick={async () => {
                    proposeMilestoneExtension();
                  }}
                  className="mb-10 ms-6"
                >
                  {step === 3 ? (
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                      <svg
                        className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 12"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5.917 5.724 10.5 15 1.5"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                      <svg
                        className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 18 20"
                      >
                        <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                      </svg>
                    </span>
                  )}
                  <h3 className="font-medium leading-tight">
                    Propose milestone extension
                  </h3>
                  <p className="text-sm">propose new extension</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Bootstrap;
