import { createContext, useContext, useState } from 'react';
import { ethers } from "ethers"

declare global {
    interface Window {
        ethereum: any;
    }
}

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const [account, setAccount] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [game, setGame] = useState<any>(null);

    const connectWallet = async () => {
        setIsLoading(true)
        if (typeof window.ethereum !== "undefined") {
            const { ethereum } = window;
            try {
                await ethereum.request({ method: "eth_requestAccounts" })
            } catch (error) {
                console.log(error)
            }

            const accounts = await ethereum.request({ method: "eth_accounts" })
            console.log("aa", accounts)
            const chain = await window.ethereum.request({ method: "eth_chainId" });
            let chainId = chain;
            console.log("chain ID:", chain);
            console.log("global Chain Id:", chainId);
            if (accounts.length !== 0) {
                setAccount(accounts[0]);
                console.log("Found an authorized account:", accounts);
                try{
                    if (ethereum) {
                        const provider = new ethers.providers.Web3Provider(ethereum);
                        const signer = provider.getSigner();
                        const contract = new ethers.Contract(tokenContract, tokenABI, signer);
                        try{
                            const result =await contract.fundUser();
                            console.log("result:::", result);
                        }
                        catch(e){
                            console.log(e);
                        }
                       
                    }

                }
                catch (error: any) {
                    if (error?.data?.message.includes("revert")) {
                        console.error("Transaction reverted: User already funded.");
                        setError("You have already been funded. No need for further funding.");
                    } else {
                        console.error("Error occurred during funding:", error);
                        setError("An unexpected error occurred. Please try again later.");
                    }
                }
                

            } else {
                console.log("No authorized account found");
            }
        } else {
            alert("Please install MetaMask");
        }
        setIsLoading(false)
    }
    
}