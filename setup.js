#!/usr/bin/env node

/**
 * Quick Setup Guide for Restaurant ChatBot with Paystack
 * 
 * This file helps with quick configuration during development
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  {
    key: 'VITE_PAYSTACK_PUBLIC_KEY',
    question: 'Enter your Paystack Public Key (pk_test_...): ',
    default: 'pk_test_c20af8c950fbf8824dfe70fa66110342055ff972'
  },
  {
    key: 'PAYSTACK_SECRET_KEY',
    question: 'Enter your Paystack Secret Key (sk_test_...): ',
    default: 'sk_test_yoursecretkeyhere'
  }
];

console.log('\n🚀 Restaurant ChatBot - Setup Configuration\n');
console.log('This will help you configure your Paystack credentials.\n');
console.log('Get your keys from: https://dashboard.paystack.com/settings/developers\n');

let config = {};
let currentIndex = 0;

function askQuestion() {
  if (currentIndex >= questions.length) {
    saveConfig();
    return;
  }

  const q = questions[currentIndex];
  const prompt = q.default ? `${q.question}[${q.default}] ` : q.question;

  rl.question(prompt, (answer) => {
    config[q.key] = answer || q.default;
    currentIndex++;
    askQuestion();
  });
}

function saveConfig() {
  const envPath = path.join(__dirname, '.env');
  
  let envContent = `VITE_PAYSTACK_PUBLIC_KEY=${config.VITE_PAYSTACK_PUBLIC_KEY}
PAYSTACK_SECRET_KEY=${config.PAYSTACK_SECRET_KEY}
VITE_API_URL=http://localhost:3000
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Configuration saved to .env\n');
  console.log('Next steps:');
  console.log('1. npm install                 (install dependencies)');
  console.log('2. npm run dev                 (start frontend - Terminal 1)');
  console.log('3. npm run dev:server          (start backend - Terminal 2)\n');
  console.log('Frontend: http://localhost:5173');
  console.log('Backend:  http://localhost:3000\n');
  
  rl.close();
}

askQuestion();
