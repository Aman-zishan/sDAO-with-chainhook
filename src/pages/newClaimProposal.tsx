import {
  useAccount,
  useOpenContractCall,
  useOpenContractDeploy
} from '@micro-stacks/react';
import {
  contractPrincipalCV,
  stringAsciiCV,
  stringUtf8CV
} from '@stacks/transactions';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import CodeEditor from '../components/codeEditor';
import LeftMenu from '../components/leftMenu';
import useWebSocket from 'react-use-websocket';

const initialContractBoilerplate = `;; This is a boilerplate contract for a grant milestone claim proposal\n
(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? .milestone-extension claim (as-contract .grant-proposal) u1 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5))
    (ok true)
	)
)
  `;

const NewClaimProposal = () => {
  const [code, setCode] = React.useState(initialContractBoilerplate);
  const [contractName, setContractName] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [deployed, setDeployed] = React.useState(false);

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

      // Handle the message as needed (e.g., update state, UI)
    }
  }, [lastMessage]);

  const { openContractCall, isRequestPending: isProposeReqPending } =
    useOpenContractCall();

  const { openContractDeploy, isRequestPending } = useOpenContractDeploy();
  const { stxAddress } = useAccount();
  const handleCodeChange = (code) => {
    console.log('Code in parent component:', code);
    setCode(code);
    // Do something with the code here
  };

  const onDeploy = async () => {
    console.log('deploying contract', code);
    if (!contractName || !code) return;

    await openContractDeploy({
      contractName: contractName,
      // the clarity contract above
      codeBody: code,

      onFinish: async (data: any) => {
        console.log('finished contract deploy!', data);
        setResponse(data);
        toast.success(`contract ${contractName} deployed!`);
        setDeployed(true);
      },
      onCancel: () => {
        console.log('popup closed!');
      }
    });
  };

  const onPropose = async () => {
    if (!deployed || !contractName || !title || !description) {
      return;
    }

    const functionArgs = [
      // include keyword "claim" if user misses
      // this is used to set postCondition while claiming the milestone fund
      contractPrincipalCV(stxAddress!, contractName),
      stringAsciiCV(title),
      stringUtf8CV(description)
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
              <h1 className="text-3xl font-bold mb-5">Propose Claim</h1>
              <div className="pb-5">
                <p>
                  You can propose a new grant claim by deploying a contract
                  containing your proof of work. You can write and deploy a
                  contract from here.
                </p>
              </div>

              <CodeEditor
                initialCode={initialContractBoilerplate}
                onCodeChange={handleCodeChange}
              ></CodeEditor>

              <div
                className={`${
                  deployed && 'hidden'
                } flex flex-row items-center justify-end gap-10 mt-5 p-2`}
              >
                <div>
                  <input
                    required
                    type="text"
                    onChange={(e) => {
                      const milestoneContractName = 'claim-' + e.target.value;
                      setContractName(milestoneContractName);
                    }}
                    id="default-input"
                    placeholder="milestone contract name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      onDeploy();
                    }}
                    className=" relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-indigo-600 border-2 border-indigo-600 rounded-full hover:text-white group hover:bg-gray-50"
                  >
                    <span className="absolute left-0 block w-full h-0 transition-all bg-indigo-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                    <span className="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
                      </svg>
                    </span>
                    <span className="relative">
                      {isRequestPending ? 'request pending...' : 'Deploy'}
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={`${
                  !deployed && 'hidden'
                } flex flex-row items-center justify-end gap-10 mt-5 p-2`}
              >
                <input
                  required
                  type="text"
                  onChange={(e) => setTitle(e.target.value)}
                  id="default-input"
                  placeholder="title"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <input
                  required
                  type="text"
                  onChange={(e) => setDescription(e.target.value)}
                  id="default-input"
                  placeholder="description"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />

                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      onPropose();
                    }}
                    className=" relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-indigo-600 border-2 border-indigo-600 rounded-full hover:text-white group hover:bg-gray-50"
                  >
                    <span className="absolute left-0 block w-full h-0 transition-all bg-indigo-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                    <span className="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
                      </svg>
                    </span>
                    <span className="relative">
                      {isRequestPending ? 'request pending...' : 'Propose'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewClaimProposal;
