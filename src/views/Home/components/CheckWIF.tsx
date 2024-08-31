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

// Base58 character set

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

    // Ensure the decoded data length is at least 5 bytes (1 byte for version, 32 bytes for private key, 4 bytes for checksum)
    if (decoded.length < 5) {
      return null;
    }

    // Extract the checksum and data
    const checksum = decoded.slice(-4); // Last 4 bytes
    const data = decoded.slice(0, -4);  // All except the last 4 bytes

    // Compute the checksum from the data
    const computedChecksum = computeChecksum(data);

    // Validate the checksum
    if (!checksum.every((val, index) => val === computedChecksum[index])) {
      return null;
    }

    // Decode the private key
    const version = data[0];
    const privateKey = data.slice(1); // Remove version byte

    // Validate private key (Bitcoin private key should be 32 bytes long)
    if (privateKey.length !== 33) {
      return null;
    }
    return privateKey; // Return private key for further use  
  } catch (error) {
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
    return null;
  }
};

const CheckWIF = memo(() => {
  const [wifKey, setWifKey] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');

  useEffect(() => {
    const isValid = isValidWif(wifKey);

    if (isValid) {
      const address = convertWifToAddress(wifKey)
      
      if (address) {
      setBitcoinAddress(address)
      }
    } else {
      setBitcoinAddress('')
    }
  }, [wifKey])

  return (
    <div>
      <h1>Check WIF</h1>
      <div>
  
        <Input
          type="text"
          value={wifKey}
          onChange={(e) => {
            const value = e.target.value;
            setWifKey(value)
          }}
        />
      </div>
      <br />
  
      <div>
        <h2>Current WIF Key: {wifKey}</h2>
        {bitcoinAddress.length > 0 && <h3>Bitcoin address: {bitcoinAddress}</h3>}
        {bitcoinAddress.length > 0 && <h3>URL: <a target='_blank' href={'https://www.blockchain.com/explorer/addresses/btc/' + bitcoinAddress}>{'https://www.blockchain.com/explorer/addresses/btc/' + bitcoinAddress}</a></h3>}
        {wifKey.length > 0 && bitcoinAddress.length === 0 && (
          <h3>Invalid WIF key</h3>
        )} 
      </div>
    </div>
  );
});

export default CheckWIF;
