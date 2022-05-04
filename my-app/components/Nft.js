import CustomContainer from "./CustomContainer";
import { Contract, providers } from "ethers";
import { Input, Text, Button, FormControl, FormLabel } from "@chakra-ui/react";
import { useState } from "react";
import { useMoralis, useMoralisFile, useOpenSeaSellOrder, useRaribleLazyMint } from "react-moralis";
import {
    CONTRACT_ABI,
    CONTRACT_ADDRESS,
  } from "../constants";
import Moralis from "moralis";

export default function Nft(){

    const [amount, setAmount] = useState(0);
    // Helper function to fetch a Provider/Signer instance from Metamask
    const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Please switch to the Rinkeby network!");
      throw new Error("Please switch to the Rinkeby network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getIBOContractInstance = (providerOrSigner) => {
    return new Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      providerOrSigner
    );
  }; 

    const [input, setInput] = useState({
        bondname: '',
        description: ''
    })

    const [inputFile, setInputFile] = useState(null)

    const handleOnChange = (e) => {
        setInput(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }
    
    const {saveFile} = useMoralisFile()
    const { createSellOrder } = useOpenSeaSellOrder({
        network:'testnet',
        tokenType: 'ERC1155',
        startAmount: 1,
        endAmount: 1

    })

    return(
        <CustomContainer>
            <Text>Mint NFTs</Text>
            <form onSubmit={async e => {
                e.preventDefault()
                if(inputFile !== null && input.bondname.trim() !== '' && input.description.trim()!== ''){
                    await saveFile(input.bondname, inputFile, {
                        saveIPFS: true,
                        onSuccess: async (file) => {
                            let metadata = {
                                name: input.bondname,
                                description: input.description,
                                image: '/ipfs/' + file._hash
                            }
                            await saveFile(`metadata ${input.bondname}`, {
                                base64: btoa(JSON.stringify(metadata))
                            }, {
                                saveIPFS: true,
                                onSuccess: async (metadataFile) => {
                                    try{
                                        const signer = await getProviderOrSigner(true);
                                        const IBOContract = getIBOContractInstance(signer);
                                        const txn = await IBOContract.mintToken('/ipfs/' + metadataFile._hash, amount);
                                        await txn.wait();
                                    }catch (error) {
                                        console.error(error);
                                        window.alert(error.data.message);
                                    }
                                    await Moralis.enableWeb3()
                                    await createSellOrder({
                                        params:{
                                            tokenUri: '/ipfs/' + metadataFile._hash
                                        }
                                    })
                                }
                            })
                        },
                        onError: (error) => {
                            console.log(error)
                        }
                    })
                }
            }}>
                <FormControl>
                    <FormLabel htmlFor="bondname">Bond name</FormLabel>
                    <Input id="bondname" name="bondname" type="text" placeholder="ex. YPFAR20" value={input.bondname} onChange = {e => handleOnChange(e)}></Input>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <Input id="description" name="description" type="text" placeholder="capital x interest x" value={input.description} onChange = {e => handleOnChange(e)}></Input>
                    <FormLabel htmlFor="description">Amount</FormLabel>
                    <Input id="amount" name="amount" type="number" placeholder="amount"  onChange = {e => setAmount(e)}></Input>
                    <FormLabel htmlFor="file">Upload File</FormLabel>
                    <Input id="filenft" type="file" onChange={ e => setInputFile(e.target.files[0]) }></Input>
                </FormControl>
                <Button type="submit" colorScheme="purple" >Change Username</Button>
            </form>
        </CustomContainer>
    )
}