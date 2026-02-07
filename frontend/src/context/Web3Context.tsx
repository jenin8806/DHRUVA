import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';
import type { BlockchainCredential } from '../types/index';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
    account: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    isActive: boolean;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    registerDID: (did: string) => Promise<void>;
    issueCredential: (holder: string, credentialHash: string, expiryDate: number, name: string, experience: string) => Promise<void>;
    registerDocument: (documentHash: string, validFrom: number, validTo: number, organizationName: string) => Promise<void>;
    revokeCredential: (credentialHash: string) => Promise<void>;
    verifyCredential: (credentialHash: string) => Promise<BlockchainCredential>;
    getHolderCredentials: (holder: string) => Promise<string[]>;
    getIssuerCredentials: (issuer: string) => Promise<string[]>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

    useEffect(() => {
        if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    browserProvider.getSigner().then(s => setSigner(s));
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            });
        }
    }, []);

    const connect = async () => {
        if (window.ethereum) {
            try {
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(browserProvider);
                
                const accounts = await browserProvider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    const s = await browserProvider.getSigner();
                    setSigner(s);
                }
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                alert("Failed to connect wallet. Please try again.");
            }
        } else {
            alert("MetaMask (or compatible wallet) is not installed.");
        }
    };

    const disconnect = () => {
        setAccount(null);
        setSigner(null);
    };

    const registerDID = async (did: string) => {
        if (!signer) throw new Error("Wallet not connected");
        const { registerDID: register } = await import('../services/contractService');
        await register(did, signer);
    };

    const issueCredential = async (holder: string, credentialHash: string, expiryDate: number, name: string, experience: string) => {
        if (!signer) throw new Error("Wallet not connected");
        const { issueCredential: issue } = await import('../services/contractService');
        await issue(holder, credentialHash, expiryDate, name, experience, signer);
    };

    const registerDocument = async (documentHash: string, validFrom: number, validTo: number, organizationName: string) => {
        if (!signer) throw new Error("Wallet not connected");
        const { registerDocument: register } = await import('../services/contractService');
        await register(documentHash, validFrom, validTo, organizationName, signer);
    };

    const revokeCredential = async (credentialHash: string) => {
        if (!signer) throw new Error("Wallet not connected");
        const { revokeCredential: revoke } = await import('../services/contractService');
        await revoke(credentialHash, signer);
    };

    const verifyCredential = async (credentialHash: string): Promise<BlockchainCredential> => {
        if (!provider) throw new Error("Provider not available");
        const { verifyCredential: verify } = await import('../services/contractService');
        return await verify(credentialHash, provider);
    };

    const getHolderCredentials = async (holder: string): Promise<string[]> => {
        if (!provider) throw new Error("Provider not available");
        const { getHolderCredentials: getCredentials } = await import('../services/contractService');
        return await getCredentials(holder, provider);
    };

    const getIssuerCredentials = async (issuer: string): Promise<string[]> => {
        if (!provider) throw new Error("Provider not available");
        const { getIssuerCredentials: getCredentials } = await import('../services/contractService');
        return await getCredentials(issuer, provider);
    };

    return (
        <Web3Context.Provider
            value={{
                account,
                connect,
                disconnect,
                isActive: !!account,
                provider,
                signer,
                registerDID,
                issueCredential,
                registerDocument,
                revokeCredential,
                verifyCredential,
                getHolderCredentials,
                getIssuerCredentials,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error("useWeb3 must be used within a Web3Provider");
    }
    return context;
};
