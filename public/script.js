document.addEventListener("DOMContentLoaded", () => {
    // Event listener for connecting the wallet
    document.getElementById('connect-wallet-button').addEventListener('click', connectWallet);

    // Fetch crypto prices on page load
    fetchCryptoPrices();
});

// Function to connect to MetaMask and fetch wallet balance and transaction history
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this feature.');
        return;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
            const address = await getCurrentAddress(); // Get the current address
            await getWalletBalance(); // Fetch and display balance
            await getTransactionHistory(address); // Fetch and display transaction history
        }
    } catch (error) {
        console.error('Error connecting to wallet:', error);
        alert('Failed to connect to MetaMask. Please try again.');
    }
}

// Function to fetch and display wallet balance
async function getWalletBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Get the user's address
    const address = await signer.getAddress();

    // Fetch the balance
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    // Update the wallet balance display
    document.getElementById('wallet-balance').textContent = `Balance: ${formattedBalance} ETH`;
}

// Function to fetch and display transaction history
async function getTransactionHistory(address) {
    const apiKey = '4R4HV4TH5BGQZCWG8IC9NRPIIVQFDV59FD'; // Replace with your Etherscan API Key
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === '1') {
            displayTransactions(data.result);
        } else {
            console.error('Error fetching transaction history:', data.message);
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

// Function to display transactions in the DOM
function displayTransactions(transactions) {
    const transactionList = document.getElementById('transaction-history');
    transactionList.innerHTML = ''; // Clear previous transactions

    transactions.forEach(tx => {
        const txElement = document.createElement('li');
        txElement.textContent = `Hash: ${tx.hash.slice(0, 10)}... | Value: ${ethers.utils.formatEther(tx.value)} ETH | Block: ${tx.blockNumber}`;
        transactionList.appendChild(txElement);
    });
}

// Function to fetch cryptocurrency prices (using CoinGecko API)
async function fetchCryptoPrices() {
    const apiURL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd&include_24hr_change=true';

    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        displayCryptoPrices(data);
    } catch (error) {
        console.error('Error fetching cryptocurrency prices:', error);
    }
}

// Function to display cryptocurrency prices
function displayCryptoPrices(prices) {
    const priceContainer = document.getElementById('crypto-prices');
    priceContainer.innerHTML = ''; // Clear previous data

    Object.keys(prices).forEach(crypto => {
        const priceData = prices[crypto];
        const priceElement = document.createElement('div');
        priceElement.innerHTML = `
            <p><strong>${crypto.charAt(0).toUpperCase() + crypto.slice(1)}:</strong> $${priceData.usd} USD</p>
            <p>24h Change: ${priceData.usd_24h_change.toFixed(2)}%</p>
        `;
        priceContainer.appendChild(priceElement);
    });
}
