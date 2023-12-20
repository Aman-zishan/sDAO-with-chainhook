/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const app = express();
app.use(express.json());
var cors = require('cors');
app.use(cors({ origin: '*' }));
const WebSocket = require('ws');
const http = require('http');

require('dotenv').config();
const createClient = require('@supabase/supabase-js').createClient;

const supabase = createClient(
  process.env.VITE_SUPABASE_PROJECT_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Function to send message to all connected WebSocket clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log('SENDING MESSAGE TO CLIENT :::', data);
      client.send(JSON.stringify(data));
    }
  });
};

app.get('', (req, res) => {
  res.send('Hello from sDAO server!');
});

// return the current step of the bootstrap process
app.get('/api/current-step', async (req, res) => {
  const { data: currentData, error: currentDataError } = await supabase
    .from('bootstrap')
    .select('*');

  if (currentDataError) {
    console.error('Error fetching current step:', currentDataError);
    return res.status(500).send({ message: 'Error fetching current step' });
  }

  res.send(currentData);
});

// returns a list of all proposals
app.get('/api/proposals', async (req, res) => {
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*');
  if (error) {
    console.log(error);
  }
  res.send(proposals);
});

// triggers when an STX transfer has occurred
app.post('/api/chainhook/bootstrap/stx-transfer', async (req, res) => {
  console.log('=====================================');
  console.log('STX INITIAL TRANSFER');
  console.log('=====================================');
  const events = req.body;
  let chainState = false;
  let currentStep = 0;
  const { data: currentData, error: currentDataError } = await supabase
    .from('bootstrap')
    .select('current_step')
    .eq('id', 1)
    .single();

  if (!currentDataError) {
    currentStep = currentData.current_step;
    //return res.status(500).send({ message: 'Error fetching current step' });
  }

  if (!(currentStep > 1)) {
    // Loop through each item in the apply array
    events.apply.forEach(async (item) => {
      // Loop through each transaction in the item
      item.transactions.forEach(async (transaction) => {
        // If the transaction has operations, loop through them
        if (transaction.operations) {
          transaction.operations.forEach(async (operation) => {
            // Log the operation
            console.log(operation.status);
            if (operation.status === 'SUCCESS') {
              chainState = true;
              console.log('successful STX transfer');
              const { error } = await supabase.from('bootstrap').upsert({
                id: 1,
                current_step: 1
              });
              if (error) {
                console.log(error);
              }
            }
          });
        }
      });
    });
  }

  // broadcast the message to frontend
  if (chainState) {
    broadcast({ message: 'STX transfer successful!', type: 'success' });
  }

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'message received' });
});

// triggers when core contract construct function is invoked
app.post('/api/chainhook/bootstrap/construct-call', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('CONSTRUCT CALL');
  console.log('=====================================');
  console.log(events);
  let chainState = false;
  const { data: currentData, error: currentDataError } = await supabase
    .from('bootstrap')
    .select('current_step')
    .eq('id', 1)
    .single();

  if (currentDataError) {
    console.error('Error fetching current step:', currentDataError);
    //return res.status(500).send({ message: 'Error fetching current step' });
  }
  const currentStep = currentData.current_step;
  if (!(currentStep > 2)) {
    events.apply.forEach(async (item) => {
      item.transactions.forEach(async (transaction) => {
        if (transaction.operations) {
          transaction.operations.forEach(async (operation) => {
            console.log(operation);
            console.log(operation.status);
            if (operation.status === 'SUCCESS') {
              chainState = true;
              const { error } = await supabase.from('bootstrap').upsert({
                id: 1,
                current_step: 2
              });
              if (error) {
                console.log(error);
              }
            }
          });
        }
      });
    });
  } else {
    console.log('Current step is 3 or higher, not updating to 2');
  }

  if (chainState) {
    broadcast({
      message: 'bootstrap construct function invoked!',
      type: 'success'
    });
  } else {
    broadcast({ message: 'something went wrong!', type: 'error' });
  }

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'message received' });
});

// triggers when a proposal is submitted
app.post('/api/chainhook/proposal-submission', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('PROPOSAL SUBMISSION');
  console.log('=====================================');
  console.log(events);

  let chainState = false;

  events.apply.forEach(async (item) => {
    // Loop through each transaction in the item
    console.log('TX ITEM LENGTH::', item.transactions.length);
    item.transactions.forEach(async (transaction) => {
      if (transaction.metadata.success) {
        chainState = true;
        console.log('EVENTS::', transaction.metadata.description);
        const regex = /\((.*?)\)/;
        const match = transaction.metadata.description.match(regex);

        // Extracting and splitting the content inside the parentheses
        let splitText = [];
        if (match && match[1]) {
          splitText = match[1].split(',').map((item) => item.trim());
        }

        console.log('PROCESSED STRING:', splitText);
        const { error: proposalInsertionError } = await supabase
          .from('proposals')
          .insert({
            address: splitText[0].split('.')[0],
            proposal_name: splitText[0].split('.')[1]
          });

        const { error } = await supabase.from('bootstrap').upsert({
          id: 1,
          current_step: 3
        });

        if (error) {
          console.log('ERROR ::::: ', error);
        }

        if (proposalInsertionError) {
          console.log('ERROR ::::: ', proposalInsertionError);
        }
      }
    });
  });

  if (chainState) {
    broadcast({
      message: 'new proposal submitted!',
      type: 'success'
    });
  } else {
    broadcast({ message: 'something went wrong!', type: 'error' });
  }

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'message received' });
});

// triggers when a proposal is voted on
app.post('/api/chainhook/proposal-vote', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('PROPOSAL VOTE');
  console.log('=====================================');
  console.log(events);

  let chainState = false;
  let voteNumber = 0;

  events.apply.forEach(async (item) => {
    // Loop through each transaction in the item
    console.log('TX ITEM LENGTH::', item.transactions.length);
    item.transactions.forEach(async (transaction) => {
      if (transaction.metadata.success) {
        console.log('EVENTS::', transaction.metadata.description);
        chainState = true;
        const match = transaction.metadata.description.match(/::vote\(u(\d+),/);
        if (match && match[1]) {
          voteNumber = parseInt(match[1], 10);
        }
      }
    });
  });

  if (chainState) {
    broadcast({
      message: `${voteNumber} votes cast on proposal`,
      type: 'success'
    });
  } else {
    broadcast({ message: 'something went wrong!', type: 'error' });
  }

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'message received' });
});

// triggers when a proposal is concluded
app.post('/api/chainhook/proposal-conclude', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('PROPOSAL CONCLUDE');
  console.log('=====================================');
  console.log(events);

  let chainState = false;

  events.apply.forEach(async (item) => {
    // Loop through each transaction in the item
    console.log('TX ITEM LENGTH::', item.transactions.length);
    item.transactions.forEach(async (transaction) => {
      if (transaction.metadata.success) {
        console.log('EVENTS::', transaction.metadata.description);

        chainState = true;
      }
    });
  });

  if (chainState) {
    broadcast({
      message: ' proposal concluded!',
      type: 'success'
    });
  } else {
    broadcast({ message: 'something went wrong!', type: 'error' });
  }

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'message received' });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
