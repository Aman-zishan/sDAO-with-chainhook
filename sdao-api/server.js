/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
const createClient = require('@supabase/supabase-js').createClient;

const supabase = createClient(
  process.env.VITE_SUPABASE_PROJECT_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

app.post('/api/chainhook/bootstrap/stx-transfer', async (req, res) => {
  console.log('=====================================');
  console.log('STX INITIAL TRANSFER');
  console.log('=====================================');
  const events = req.body;
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

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'STX transfer done!' });
});

app.post('/api/chainhook/bootstrap/construct-call', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('CONSTRUCT CALL');
  console.log('=====================================');
  console.log(events);
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
              const { data: responseData, error } = await supabase
                .from('bootstrap')
                .upsert({
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

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'contruct function called!' });
});

app.post('/api/chainhook/bootstrap/propose-extension', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('EXTENSION PROPOSAL');
  console.log('=====================================');
  console.log(events);

  events.apply.forEach(async (item) => {
    // Loop through each transaction in the item
    console.log('TX ITEM LENGTH::', item.transactions.length);
    item.transactions.forEach(async (transaction) => {
      if (transaction.metadata.success) {
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

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'milestone extension proposed!' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
