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
  const events = req.body;
  // Loop through each item in the apply array
  events.apply.forEach((item) => {
    // Loop through each transaction in the item
    item.transactions.forEach((transaction) => {
      // If the transaction has operations, loop through them
      if (transaction.operations) {
        transaction.operations.forEach(async (operation) => {
          // Log the operation
          console.log(operation.status);
          if (operation.status === 'SUCCESS') {
            const { data: responseData, error } = await supabase
              .from('bootstrap')
              .upsert({
                id: 1,
                initial_stx_transfer: true
              });

            console.log(error);
          }
        });
      }
    });
  });

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'Proposal added!' });
});

app.post('/api/chainhook/bootstrap/construct-call', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('CONSTRUCT CALL');
  console.log('=====================================');
  console.log(events);
  // Loop through each item in the apply array
  events.apply.forEach((item) => {
    // Loop through each transaction in the item
    item.transactions.forEach((transaction) => {
      // If the transaction has operations, loop through them
      if (transaction.operations) {
        transaction.operations.forEach(async (operation) => {
          // Log the operation
          console.log(operation);
          console.log(operation.status);
          if (operation.status === 'SUCCESS') {
            const { data: responseData, error } = await supabase
              .from('bootstrap')
              .upsert({
                id: 1,
                construct_bootstrap: true
              });

            console.log(error);
          }
        });
      }
    });
  });

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'Proposal added!' });
});

app.post('/api/chainhook/bootstrap/propose-extension', async (req, res) => {
  const events = req.body;
  console.log('=====================================');
  console.log('EXTENSION PROPOSAL');
  console.log('=====================================');
  console.log(events);
  // Loop through each item in the apply array
  events.apply.forEach((item) => {
    // Loop through each transaction in the item
    item.transactions.forEach(async (transaction) => {
      console.log('PROPOSAL TRANSACTION :::', transaction);
      if (transaction.metadata.success) {
        const { error } = await supabase.from('bootstrap').upsert({
          id: 1,
          proposed_milestone_extension: true
        });

        console.log(error);
      }
    });
  });

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: 'Proposal added!' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
