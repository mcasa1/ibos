import { Button, FormControl, FormLabel, Input, Text } from "@chakra-ui/react";
import CustomContainer from "./CustomContainer";
import { useState } from "react";
import { useMoralis } from "react-moralis";

export default function Profile({user}){
    const [input, setInput] = useState('')
    const {setUserData, isUserUpdating} = useMoralis()
    return(
        <CustomContainer>
            <Text><b>Username:</b>{user.getUsername()}</Text>
            <Text><b>Wallet Address:</b>{user.get('ethAddress')}</Text>
            <form onSubmit={e => {
                e.preventDefault()
                if(input.trim() !== ''){
                    setUserData({
                        setusername: input
                    }).then(() => setInput(''))
                }
            }}>
                <FormControl>
                    <FormLabel htmlFor="username">Set a new Username</FormLabel>
                    <Input id="username" type="text" placeholder="ex. martincasaa" value={input} onChange = {e => setInput(e.target.value)}></Input>
                </FormControl>
                <Button type="submit" colorScheme="purple" disabled={isUserUpdating}>Change Username</Button>
            </form>
        </CustomContainer>
    )
}