import React, { useEffect, useState } from 'react';

const ServerStatus: React.FC = () => {
  const [isServerActive, setIsServerActive] = useState<boolean | null>(null);
  const [isDevnetActive, setIsDevnetActive] = useState<boolean | null>(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000');
        console.log('Server response:', response);
        if (response.ok) {
          setIsServerActive(true);
        } else {
          setIsServerActive(false);
        }
      } catch (error) {
        setIsServerActive(false);
      }
    };
    const checkDevnetStatus = async () => {
      try {
        const response = await fetch(
          'http://localhost:3999/extended/v1/status'
        );
        console.log('Server response:', response);
        if (response.ok) {
          setIsDevnetActive(true);
        } else {
          setIsDevnetActive(false);
        }
      } catch (error) {
        setIsDevnetActive(false);
      }
    };

    checkServerStatus();
    checkDevnetStatus();
  }, []);

  let serverStatusText = 'Checking...';
  let serverStatusColor = 'gray';

  let devnetStatusText = 'Checking...';
  let devnetStatusColor = 'gray';

  if (isServerActive === true) {
    serverStatusText = 'Online';
    serverStatusColor = 'teal';
  } else if (isServerActive === false) {
    serverStatusText = 'Offline';
    serverStatusColor = 'red';
  }

  if (isDevnetActive === true) {
    devnetStatusText = 'Online';
    devnetStatusColor = 'teal';
  } else if (isDevnetActive === false) {
    devnetStatusText = 'Offline';
    devnetStatusColor = 'red';
  }

  return (
    <div className="fixed z-90 bottom-1 right-8  w-100 h-20 flex flex-row justify-center items-center gap-2">
      <span
        className={`py-1 px-2 inline-flex items-center gap-x-1 text-sm font-medium bg-${serverStatusColor}-100 text-${serverStatusColor}-800 rounded-full dark:bg-${serverStatusColor}-500/10`}
      >
        {isServerActive ? (
          <svg
            className="flex-shrink-0 w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ) : (
          <svg
            className="flex-shrink-0 w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        )}
        Server {serverStatusText}
      </span>

      <span
        className={`py-1 px-2 inline-flex items-center gap-x-1 text-sm font-medium bg-${devnetStatusColor}-100 text-${devnetStatusColor}-800 rounded-full dark:bg-${devnetStatusColor}-500/10`}
      >
        {isDevnetActive ? (
          <svg
            className="flex-shrink-0 w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ) : (
          <svg
            className="flex-shrink-0 w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        )}
        Devnet {devnetStatusText}
      </span>
    </div>
  );
};

export default ServerStatus;
