import { memo, useEffect, useState } from 'react';
import { useChartsConfig } from '@/hooks/web/antCharts/useChartsConfig';
import { Input, Button} from 'antd';
import bs58 from 'bs58';
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

//New

import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// You need to provide the ECC library. The ECC library must implement 
// all the methods of the `TinySecp256k1Interface` interface.
// import * as tinysecp from 'tiny-secp256k1';
// const ECPair: ECPairAPI = ECPairFactory(tinysecp);

// Elliptic curve for Bitcoin (secp256k1)
// const EC = elliptic.ec;
// const ec = new EC('secp256k1');

// Utility function to increment a Base58 string
const incrementBase58 = (str: string, baseAlphabet: string) => {
  const chars = str.split("");
  let i = 0;
  let carry = true;

  while (i < chars.length && carry) {
    const index = baseAlphabet.indexOf(chars[i]);
    if (index === baseAlphabet.length - 1) {
      chars[i] = baseAlphabet[0];
    } else {
      chars[i] = baseAlphabet[index + 1];
      carry = false; // No more carry needed
    }
    i++;
  }

  // Handle overflow if carry is still true after processing all characters
  if (carry) {
    chars.push(baseAlphabet[0]);
  }

  return chars.join("");
};

// Example rule to check for no 4 consecutive characters
const noThreeConsecutiveRule = (wif: any, newChar: any) => {
  const newWif = wif + newChar;  // Simulate adding the new character

  // Check if the newWif contains three consecutive identical characters
  for (let i = 0; i < newWif.length - 2; i++) {
    if (newWif[i] === newWif[i + 1] && newWif[i] === newWif[i + 2]) {
      return false;  // Rule is violated
    }
  }

  return true;  // Rule is satisfied
};

// Function to apply all rules to the WIF key
const applyRules = (wif: any, rules: any) => {
  return rules.every((rule: any) => rule(wif));  // Apply all rules
};

// Function to compute checksum
const computeChecksum = (data: Uint8Array) => {
  // First SHA-256 hash
  const hash1 = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(data)).toString(CryptoJS.enc.Hex);
  
  // Second SHA-256 hash
  const hash2 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(hash1)).toString(CryptoJS.enc.Hex);
  
  // Get first 4 bytes of the second hash
  const checksumHex = hash2.slice(0, 8); // First 4 bytes in hex
  const checksumBytes = new Uint8Array(checksumHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  return checksumBytes;
};

const isValidWif = (wif: string): Uint8Array | null => {
  try {
    // Decode the WIF key from Base58
    const decoded = bs58.decode(wif);
    //console.log("Decoded:", decoded);

    // Ensure the decoded data length is at least 5 bytes (1 byte for version, 32 bytes for private key, 4 bytes for checksum)
    if (decoded.length < 5) {
      //console.log("Decoded data length is too short:", decoded.length);
      return null;
    }

    // Extract the checksum and data
    const checksum = decoded.slice(-4); // Last 4 bytes
    const data = decoded.slice(0, -4);  // All except the last 4 bytes

    // Compute the checksum from the data
    const computedChecksum = computeChecksum(data);
    //console.log("Computed Checksum:", computedChecksum);
    //console.log("Extracted Checksum:", checksum);

    // Validate the checksum
    if (!checksum.every((val, index) => val === computedChecksum[index])) {
      //console.log("Checksum mismatch:", checksum, computedChecksum);
      return null;
    }

    // Decode the private key
    const version = data[0];
    const privateKey = data.slice(1); // Remove version byte
    //console.log("Version Byte:", version);
    //console.log("Private Key Length:", privateKey.length);

    // Validate private key (Bitcoin private key should be 32 bytes long)
    if (privateKey.length !== 33) {
      //console.log("Invalid private key length:", privateKey.length);
      return null;
    }
    //console.log(privateKey)
    return privateKey; // Return private key for further use  
  } catch (error) {
   // console.error("Error decoding WIF:", error);
    return null; // Decoding failed or other error occurred
  }
};

// Function to derive public key from private key
const convertWifToAddress = (wif: any) => {
  const ecpair = ECPairFactory(ecc);

  try {
    // Step 1: Decode the WIF key to get the private key
    const keyPair = ecpair.fromWIF(wif);

    // Step 2: Get the public key in a compressed format
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

    return address;
  } catch (error) {
    //console.error('Invalid WIF or error in conversion:', error);
    return null;
  }
};


// Function to generate a valid default WIF key
const generateDefaultWif = (prefix: string, defaultValue: string) => {
  return prefix + defaultValue
};


const GenerateWIF = memo(() => {

  const defaultPrefix = "K5";
  const DEFAULT_VALUE = "A1B2C3D4E5F6G7H8J9K0L1M2N3P4Q5R6S7T8U9VwXyZ"
  const [prefix, setPrefix] = useState(() => {
    const savedWif = localStorage.getItem("currentWif");
    return savedWif?.slice(0, 2) || defaultPrefix
  }); // Default prefix
  const [defaultValue, setDefault] = useState(
    () => {
      const savedWif = localStorage.getItem("currentWif");
      return savedWif?.slice(2) || DEFAULT_VALUE
    }
  );
  const [currentWif, setCurrentWif] = useState(() => {
    const savedWif = localStorage.getItem("currentWif");
    return savedWif || generateDefaultWif(prefix, defaultValue);
  });
  const [isRunning, setIsRunning] = useState(false);
  const [rules, setRules] = useState([]); // Initial rules
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [baseAlphabet, setBaseAlphabet] = useState(
    () => {
      const baseAlphabet = localStorage.getItem('baseAlphabet');
      return baseAlphabet && baseAlphabet.length > 0 ? baseAlphabet : '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    });
  const [speed, setSpeed] = useState(() => {
    const speed = localStorage.getItem("speed");
    return speed ? parseInt(speed) : 1 || 1
  });

  // Function to generate next WIF key
  const generateNextWif = () => {
    const nextWifBody = incrementBase58(currentWif.substring(prefix.length), baseAlphabet);
    return prefix + nextWifBody;
  };

  useEffect(() => {
    if (isRunning) {

      const isWifKey = convertWifToAddress(currentWif);

          if (isWifKey != null) {
            setCurrentWif(currentWif);
            setBitcoinAddress(isWifKey);
            localStorage.setItem("currentWif", currentWif);
            setIsRunning(false);
          }
          
      const interval = setInterval(() => {
        const nextWif = generateNextWif();
        if (applyRules(nextWif, rules)) {
          const isWifKey = convertWifToAddress(nextWif);
          if (isWifKey != null) {
            setCurrentWif(nextWif);
            setBitcoinAddress(isWifKey);
            localStorage.setItem("currentWif", nextWif);
            setIsRunning(false);
          } else {
            setCurrentWif(nextWif);
            localStorage.setItem("currentWif", nextWif);
          }
        } else {
          setCurrentWif(nextWif);
          localStorage.setItem("currentWif", nextWif);
        }
      }, speed || 0); // Adjust interval delay as needed

      return () => clearInterval(interval); // Clean up on unmount
    }
  }, [isRunning, currentWif, prefix, rules]);

  return (
    <div>
      <h1>WIF Key Generator</h1>
      <div>
        <label>BaseAlphabet (Let op de sequence gebruikt deze order dus als jij een A ergens als default value hebbeb dan zullen de 1,2,3,4,5,6,7,8,9 niet meer gecheckt worden op de plek waar de A staat) </label>
        <Input
          type="text"
          value={baseAlphabet}
          onChange={(e) => {
            setBaseAlphabet(e.target.value)
            localStorage.setItem("baseAlphabet", e.target.value);
          }}
        />
      </div>
      <br />
      <div>
        <label>Speed in Miliseconds</label>
        <Input
          type="number"
          value={speed}
          onChange={(e) => {
            setSpeed(parseInt(e.target.value))
            localStorage.setItem("speed", e.target.value);
          }}
        />
      </div>
      <br />
      <div>
        <label>Prefix: </label>
        <Input
          type="text"
          value={prefix}
          onChange={(e) => {
            const newPrefix = e.target.value;
            setPrefix(newPrefix);
            setCurrentWif(generateDefaultWif(newPrefix, defaultValue));
            setBitcoinAddress('')
          }}
        />
      </div>
      <br />
      <div>
        <label>Start value: (Prefix is al gezet) Let op localstorage word overschreven op het moment dat je deze value aanpast en op start klikt)</label>
        <Input
          type="text"
          prefix={prefix}
          value={defaultValue}
          maxLength={51 - prefix.length}
          onChange={(e) => {
            setDefault(e.target.value)
            setCurrentWif(generateDefaultWif(prefix, e.target.value));
            setBitcoinAddress('')
          }}
        />
      </div>
      <br />
      <div>
        <h2>Current WIF value: {currentWif}</h2>
        {bitcoinAddress.length > 0 && <h3>Bitcoin address: {bitcoinAddress}</h3>}
        {bitcoinAddress.length > 0 && <h3>URL: <a target='_blank' href={'https://www.blockchain.com/explorer/addresses/btc/' + bitcoinAddress}>{'https://www.blockchain.com/explorer/addresses/btc/' + bitcoinAddress}</a></h3>}
        {isRunning && <p>Automatic sequence running...</p>}
      </div>
      <div>
        <Button style={isRunning ? {backgroundColor: 'red', color: '#fff'} : {backgroundColor: 'green', color: '#fff'}} onClick={() => {
  
          setIsRunning(!isRunning)
        }}>
          {isRunning ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
});

export default GenerateWIF;
